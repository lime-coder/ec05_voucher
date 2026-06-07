import prisma from '../config/db';
import { LogService } from './log.service';
import { AUDIT_ACTIONS, LOG_STATUS, ANOMALY_THRESHOLDS } from '../config/audit.config';

/**
 * AnomalyService — Post-action rule-based anomaly detection.
 * 
 * Called after business events (order creation, etc.) to check
 * if the activity matches any suspicious patterns. If a rule
 * triggers, a CANH_BAO log entry is created for admin review.
 * 
 * This is intentionally simple (SQL queries, not a streaming engine)
 * to keep things practical for the project scope.
 */
export class AnomalyService {

  /**
   * Run all purchase anomaly checks after an order is placed.
   * Call this from the order service after successfully saving an order.
   */
  static async checkOrder(params: {
    IDTaiKhoan: number;
    MaDonHang: number;
    items: Array<{ VoucherID: number; TenVoucher: string; SoLuongMua: number }>;
    TongTien: number;
    DiaChiIP?: string;
  }): Promise<void> {
    const { IDTaiKhoan, MaDonHang, items, TongTien, DiaChiIP } = params;
    const thresholds = ANOMALY_THRESHOLDS.PURCHASE;

    try {
      // ── Rule 1: Bulk quantity in single order ────────────────────
      for (const item of items) {
        if (item.SoLuongMua >= thresholds.BULK_QUANTITY) {
          await LogService.createLog({
            IDTaiKhoan,
            HanhDong: AUDIT_ACTIONS.CANH_BAO_MUA_HANG,
            DoiTuong: `Đơn hàng #${MaDonHang}`,
            ChiTiet: `[MUA_SO_LUONG_LON] Mua ${item.SoLuongMua} voucher '${item.TenVoucher}' trong 1 đơn hàng. Ngưỡng: ${thresholds.BULK_QUANTITY}`,
            DiaChiIP,
            TrangThai: LOG_STATUS.WARNING,
          });
        }
      }

      // ── Rule 2: Repeated purchase of same voucher within 24h ────
      for (const item of items) {
        const repeatCount = await this.countRecentPurchases(
          IDTaiKhoan,
          item.VoucherID,
          thresholds.REPEAT_PURCHASE_WINDOW_HOURS
        );
        if (repeatCount >= thresholds.REPEAT_PURCHASE_COUNT) {
          await LogService.createLog({
            IDTaiKhoan,
            HanhDong: AUDIT_ACTIONS.CANH_BAO_MUA_HANG,
            DoiTuong: `Đơn hàng #${MaDonHang}`,
            ChiTiet: `[MUA_NHIEU_LAN] Đã mua voucher '${item.TenVoucher}' trong ${repeatCount} đơn hàng riêng biệt trong ${thresholds.REPEAT_PURCHASE_WINDOW_HOURS}h qua. Ngưỡng: ${thresholds.REPEAT_PURCHASE_COUNT}`,
            DiaChiIP,
            TrangThai: LOG_STATUS.WARNING,
          });
        }
      }

      // ── Rule 3: Order velocity (too many orders too fast) ───────
      const recentOrderCount = await this.countRecentOrders(
        IDTaiKhoan,
        thresholds.VELOCITY_WINDOW_MINUTES
      );
      if (recentOrderCount >= thresholds.VELOCITY_ORDER_COUNT) {
        await LogService.createLog({
          IDTaiKhoan,
          HanhDong: AUDIT_ACTIONS.CANH_BAO_MUA_HANG,
          DoiTuong: `Đơn hàng #${MaDonHang}`,
          ChiTiet: `[MUA_LIEN_TUC] Đã đặt ${recentOrderCount} đơn hàng trong ${thresholds.VELOCITY_WINDOW_MINUTES} phút qua. Ngưỡng: ${thresholds.VELOCITY_ORDER_COUNT}`,
          DiaChiIP,
          TrangThai: LOG_STATUS.WARNING,
        });
      }

      // ── Rule 4: High-value order ────────────────────────────────
      if (TongTien >= thresholds.HIGH_VALUE_AMOUNT) {
        await LogService.createLog({
          IDTaiKhoan,
          HanhDong: AUDIT_ACTIONS.CANH_BAO_MUA_HANG,
          DoiTuong: `Đơn hàng #${MaDonHang}`,
          ChiTiet: `[TONG_TIEN_BAT_THUONG] Tổng tiền đơn hàng: ${TongTien.toLocaleString('vi-VN')}₫. Ngưỡng: ${thresholds.HIGH_VALUE_AMOUNT.toLocaleString('vi-VN')}₫`,
          DiaChiIP,
          TrangThai: LOG_STATUS.WARNING,
        });
      }
    } catch (error) {
      // Anomaly checks should never break the main flow
      console.error('Anomaly detection error:', error);
    }
  }

  /**
   * Check login attempt patterns and create warning logs if thresholds are exceeded.
   * Called from auth.service after logging a failed login.
   */
  static async checkLoginAttempt(params: {
    username: string;
    ip: string;
    targetAccountId?: number | null;
    targetRole?: string;
  }): Promise<{ shouldNotifyUser: boolean; failCount: number }> {
    const { username, ip, targetAccountId, targetRole } = params;
    const thresholds = ANOMALY_THRESHOLDS.LOGIN;

    let shouldNotifyUser = false;

    try {
      // Count failures for this username
      const userFailCount = await LogService.countRecentFailedLogins(
        username,
        thresholds.WINDOW_MINUTES
      );

      // Count failures from this IP (any username)
      const ipFailCount = await LogService.countRecentFailedLoginsByIP(
        ip,
        thresholds.WINDOW_MINUTES
      );

      // Always flag if targeting an admin account
      if (targetRole === 'admin' && targetAccountId) {
        await LogService.createLog({
          IDTaiKhoan: targetAccountId,
          HanhDong: AUDIT_ACTIONS.CANH_BAO_DANG_NHAP,
          DoiTuong: username,
          ChiTiet: `[ADMIN_TARGET] Phát hiện cố gắng đăng nhập vào tài khoản Admin '${username}' từ IP ${ip}. Lần thất bại thứ: ${userFailCount}`,
          DiaChiIP: ip,
          TrangThai: LOG_STATUS.WARNING,
        });
      }

      // Username-level warnings
      if (userFailCount >= thresholds.NOTIFY_THRESHOLD && targetAccountId) {
        shouldNotifyUser = true;
        await LogService.createLog({
          IDTaiKhoan: targetAccountId,
          HanhDong: AUDIT_ACTIONS.CANH_BAO_DANG_NHAP,
          DoiTuong: username,
          ChiTiet: `[BRUTE_FORCE_USER] ${userFailCount} lần đăng nhập thất bại vào tài khoản '${username}' trong ${thresholds.WINDOW_MINUTES} phút. Đã vượt ngưỡng thông báo (${thresholds.NOTIFY_THRESHOLD}). Cần thông báo cho người dùng.`,
          DiaChiIP: ip,
          TrangThai: LOG_STATUS.WARNING,
        });
      } else if (userFailCount >= thresholds.WARN_THRESHOLD && targetAccountId) {
        await LogService.createLog({
          IDTaiKhoan: targetAccountId,
          HanhDong: AUDIT_ACTIONS.CANH_BAO_DANG_NHAP,
          DoiTuong: username,
          ChiTiet: `[WARN_USER] ${userFailCount} lần đăng nhập thất bại vào tài khoản '${username}' trong ${thresholds.WINDOW_MINUTES} phút. Ngưỡng cảnh báo: ${thresholds.WARN_THRESHOLD}`,
          DiaChiIP: ip,
          TrangThai: LOG_STATUS.WARNING,
        });
      }

      // IP-level platform alert
      if (ipFailCount >= thresholds.IP_BLOCK_THRESHOLD) {
        await LogService.createLog({
          IDTaiKhoan: null,
          HanhDong: AUDIT_ACTIONS.CANH_BAO_DANG_NHAP,
          DoiTuong: ip,
          ChiTiet: `[BRUTE_FORCE_IP] IP ${ip} đã thất bại đăng nhập ${ipFailCount} lần trong ${thresholds.WINDOW_MINUTES} phút (nhiều tài khoản khác nhau). Ngưỡng: ${thresholds.IP_BLOCK_THRESHOLD}. Cần xem xét chặn IP.`,
          DiaChiIP: ip,
          TrangThai: LOG_STATUS.WARNING,
        });
      }

      return { shouldNotifyUser, failCount: userFailCount };
    } catch (error) {
      console.error('Login anomaly check error:', error);
      return { shouldNotifyUser: false, failCount: 0 };
    }
  }

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Count how many separate orders this customer placed for a specific
   * voucher within the given time window.
   */
  private static async countRecentPurchases(
    IDTaiKhoan: number,
    VoucherID: number,
    windowHours: number
  ): Promise<number> {
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(DISTINCT dh.MaDonHang) as cnt
         FROM DonHang dh
         INNER JOIN ChiTietDonHang ct ON ct.MaDonHang = dh.MaDonHang
         WHERE dh.IDTaiKhoan = @P1
           AND ct.VoucherID = @P2
           AND dh.ThoiGianThanhToan >= DATEADD(HOUR, -@P3, GETDATE())`,
        IDTaiKhoan,
        VoucherID,
        windowHours
      );
      return result[0]?.cnt || 0;
    } catch (error) {
      console.error('Failed to count recent purchases:', error);
      return 0;
    }
  }

  /**
   * Count how many orders this customer placed within the given
   * time window (minutes).
   */
  private static async countRecentOrders(
    IDTaiKhoan: number,
    windowMinutes: number
  ): Promise<number> {
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as cnt
         FROM DonHang
         WHERE IDTaiKhoan = @P1
           AND ThoiGianThanhToan >= DATEADD(MINUTE, -@P2, GETDATE())`,
        IDTaiKhoan,
        windowMinutes
      );
      return result[0]?.cnt || 0;
    } catch (error) {
      console.error('Failed to count recent orders:', error);
      return 0;
    }
  }
}
