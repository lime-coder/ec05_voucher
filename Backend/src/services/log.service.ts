import prisma from '../config/db';
import { AUDIT_ACTIONS, LOG_STATUS, ANOMALY_THRESHOLDS } from '../config/audit.config';

export interface CreateLogData {
  IDTaiKhoan?: number | null;
  HanhDong: string;
  DoiTuong?: string | null;
  ChiTiet?: string | null;
  DiaChiIP?: string | null;
  TrangThai?: string | null;
}

export interface LogFilters {
  search?: string;
  action?: string;
  status?: string;
  role?: string;
  ip?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export class LogService {
  /**
   * Create a log entry in the SystemLog table.
   * This is fire-and-forget — errors are caught silently so logging
   * never breaks the main business flow.
   */
  static async createLog(data: CreateLogData): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO SystemLog (IDTaiKhoan, HanhDong, DoiTuong, ChiTiet, DiaChiIP, TrangThai)
        VALUES (
          ${data.IDTaiKhoan || null}, 
          ${data.HanhDong}, 
          ${data.DoiTuong || null}, 
          ${data.ChiTiet || null}, 
          ${data.DiaChiIP || null}, 
          ${data.TrangThai || LOG_STATUS.SUCCESS}
        )
      `;
    } catch (error) {
      console.error('Failed to create system log:', error);
    }
  }

  /**
   * Fetch logs with comprehensive SQL-level filtering.
   * All filtering is done in SQL for performance — no more "fetch all then filter in JS".
   */
  static async getLogs(filters: LogFilters) {
    try {
      const conditions: string[] = ['1=1'];
      const params: any[] = [];
      let paramIndex = 1;

      // Filter by action type
      if (filters.action && filters.action !== 'all') {
        if (filters.action === 'approve') {
          conditions.push(`(sl.HanhDong LIKE N'%Phê duyệt%' OR sl.HanhDong LIKE N'%Approve%')`);
        } else if (filters.action === 'reject') {
          conditions.push(`(sl.HanhDong LIKE N'%Từ chối%' OR sl.HanhDong LIKE N'%Reject%')`);
        } else if (filters.action === 'lock') {
          conditions.push(`((sl.HanhDong LIKE N'%Khóa%' OR sl.HanhDong LIKE N'%Lock%') AND sl.HanhDong NOT LIKE N'%Mở khóa%' AND sl.HanhDong NOT LIKE N'%Unlock%')`);
        } else if (filters.action === 'unlock') {
          conditions.push(`(sl.HanhDong LIKE N'%Mở khóa%' OR sl.HanhDong LIKE N'%Unlock%' OR sl.HanhDong LIKE N'%Kích hoạt%' OR sl.HanhDong LIKE N'%Activate%')`);
        } else if (filters.action === 'update') {
          conditions.push(`(sl.HanhDong LIKE N'%Cập nhật%' OR sl.HanhDong LIKE N'%Update%')`);
        } else if (filters.action === 'delete') {
          conditions.push(`(sl.HanhDong LIKE N'%Xóa%' OR sl.HanhDong LIKE N'%Delete%')`);
        } else if (filters.action === 'login') {
          conditions.push(`(sl.HanhDong LIKE N'%Đăng nhập%' OR sl.HanhDong LIKE N'%Login%')`);
        } else {
          conditions.push(`sl.HanhDong = @P${paramIndex}`);
          params.push(filters.action);
          paramIndex++;
        }
      }

      // Filter by status (Thành công / Thất bại / CANH_BAO)
      if (filters.status && filters.status !== 'all') {
        conditions.push(`sl.TrangThai = @P${paramIndex}`);
        params.push(filters.status);
        paramIndex++;
      }

      // Filter by IP address
      if (filters.ip) {
        conditions.push(`sl.DiaChiIP LIKE @P${paramIndex}`);
        params.push(`%${filters.ip}%`);
        paramIndex++;
      }

      // Filter by specific user ID
      if (filters.userId) {
        conditions.push(`sl.IDTaiKhoan = @P${paramIndex}`);
        params.push(parseInt(filters.userId));
        paramIndex++;
      }

      // Filter by date range
      if (filters.dateFrom) {
        conditions.push(`sl.ThoiGian >= @P${paramIndex}`);
        params.push(new Date(filters.dateFrom));
        paramIndex++;
      }
      if (filters.dateTo) {
        // Add 1 day to include the entire end date
        const endDate = new Date(filters.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        conditions.push(`sl.ThoiGian < @P${paramIndex}`);
        params.push(endDate);
        paramIndex++;
      }

      // Filter by role — requires JOINing to determine user type
      if (filters.role && filters.role !== 'all') {
        if (filters.role === 'admin') {
          conditions.push(`EXISTS (SELECT 1 FROM Admin a WHERE a.IDTaiKhoan = sl.IDTaiKhoan)`);
        } else if (filters.role === 'partner') {
          conditions.push(`EXISTS (SELECT 1 FROM NhanVienDoiTac nv WHERE nv.IDTaiKhoan = sl.IDTaiKhoan)`);
        } else if (filters.role === 'customer') {
          conditions.push(`EXISTS (SELECT 1 FROM KhachHang kh WHERE kh.IDTaiKhoan = sl.IDTaiKhoan)`);
        }
      }

      // Free-text search across multiple fields
      if (filters.search) {
        conditions.push(`(
          sl.ChiTiet LIKE @P${paramIndex} OR 
          sl.DoiTuong LIKE @P${paramIndex} OR 
          sl.HanhDong LIKE @P${paramIndex} OR
          EXISTS (SELECT 1 FROM TaiKhoan tk WHERE tk.IDTaiKhoan = sl.IDTaiKhoan AND (
            tk.TenDangNhap LIKE @P${paramIndex} OR tk.HoTenNguoiDung LIKE @P${paramIndex}
          ))
        )`);
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      const whereClause = conditions.join(' AND ');
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM SystemLog sl WHERE ${whereClause}`;
      const countResult: any[] = await prisma.$queryRawUnsafe(countQuery, ...params);
      const total = countResult[0]?.total || 0;

      // Get paginated results with user info
      const dataQuery = `
        SELECT 
          sl.MaLog,
          sl.IDTaiKhoan,
          sl.HanhDong,
          sl.DoiTuong,
          sl.ChiTiet,
          sl.DiaChiIP,
          sl.TrangThai,
          sl.ThoiGian,
          tk.TenDangNhap,
          tk.HoTenNguoiDung,
          CASE
            WHEN EXISTS (SELECT 1 FROM Admin a WHERE a.IDTaiKhoan = sl.IDTaiKhoan) THEN 'admin'
            WHEN EXISTS (SELECT 1 FROM NhanVienDoiTac nv WHERE nv.IDTaiKhoan = sl.IDTaiKhoan) THEN 'partner'
            WHEN EXISTS (SELECT 1 FROM KhachHang kh WHERE kh.IDTaiKhoan = sl.IDTaiKhoan) THEN 'customer'
            ELSE 'unknown'
          END as VaiTro
        FROM SystemLog sl
        LEFT JOIN TaiKhoan tk ON tk.IDTaiKhoan = sl.IDTaiKhoan
        WHERE ${whereClause}
        ORDER BY sl.ThoiGian DESC
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `;

      const logs = await prisma.$queryRawUnsafe(dataQuery, ...params);

      return {
        data: logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
      return { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
  }

  /**
   * Get available distinct action types for the filter dropdown.
   */
  static async getDistinctActions(): Promise<string[]> {
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT DISTINCT HanhDong FROM SystemLog ORDER BY HanhDong`
      );
      return result.map((r: any) => r.HanhDong);
    } catch (error) {
      console.error('Failed to fetch distinct actions:', error);
      return [];
    }
  }

  /**
   * Count recent failed login attempts for a specific username.
   * Used by auth service for brute-force detection.
   */
  static async countRecentFailedLogins(
    username: string,
    windowMinutes: number = ANOMALY_THRESHOLDS.LOGIN.WINDOW_MINUTES
  ): Promise<number> {
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as cnt FROM SystemLog 
         WHERE HanhDong = @P1 
           AND DoiTuong = @P2 
           AND ThoiGian >= DATEADD(MINUTE, -@P3, GETDATE())`,
        AUDIT_ACTIONS.DANG_NHAP_THAT_BAI,
        username,
        windowMinutes
      );
      return result[0]?.cnt || 0;
    } catch (error) {
      console.error('Failed to count failed logins:', error);
      return 0;
    }
  }

  /**
   * Count recent failed login attempts from a specific IP address.
   * Used for platform-level brute-force detection.
   */
  static async countRecentFailedLoginsByIP(
    ip: string,
    windowMinutes: number = ANOMALY_THRESHOLDS.LOGIN.WINDOW_MINUTES
  ): Promise<number> {
    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as cnt FROM SystemLog 
         WHERE HanhDong = @P1 
           AND DiaChiIP = @P2 
           AND ThoiGian >= DATEADD(MINUTE, -@P3, GETDATE())`,
        AUDIT_ACTIONS.DANG_NHAP_THAT_BAI,
        ip,
        windowMinutes
      );
      return result[0]?.cnt || 0;
    } catch (error) {
      console.error('Failed to count failed logins by IP:', error);
      return 0;
    }
  }

  /**
   * Export logs as flat array (no pagination) for CSV/report export.
   */
  static async exportLogs(filters: LogFilters) {
    const result = await this.getLogs({ ...filters, page: 1, limit: 10000 });
    return result.data;
  }
}
