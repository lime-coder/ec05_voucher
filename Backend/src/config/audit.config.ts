/**
 * Audit Logging Configuration
 * 
 * Centralized constants for all audit log action names and
 * anomaly detection thresholds. Adjust thresholds here without
 * modifying service logic.
 */

// ── Tier 1: Security-Critical ────────────────────────────────────
export const AUDIT_ACTIONS = {
  // Authentication
  DANG_NHAP_THANH_CONG: 'Đăng nhập thành công',
  DANG_NHAP_THAT_BAI: 'Đăng nhập thất bại',
  DANG_XUAT: 'Đăng xuất',
  THAY_DOI_MAT_KHAU: 'Thay đổi mật khẩu',

  // Account Management (Admin actions)
  KHOA_TAI_KHOAN: 'Khóa tài khoản',
  MO_KHOA_TAI_KHOAN: 'Mở khóa tài khoản',

  // ── Tier 2: Business-Critical ──────────────────────────────────
  // Voucher lifecycle
  TAO_VOUCHER: 'Tạo voucher',
  CAP_NHAT_VOUCHER: 'Cập nhật voucher',
  XOA_VOUCHER: 'Xóa voucher',
  DUYET_VOUCHER: 'Duyệt voucher',
  TU_CHOI_VOUCHER: 'Từ chối voucher',

  // Order lifecycle
  TAO_DON_HANG: 'Tạo đơn hàng',
  THANH_TOAN_DON_HANG: 'Thanh toán đơn hàng',
  HUY_DON_HANG: 'Hủy đơn hàng',

  // Partner management
  DUYET_DOI_TAC: 'Duyệt đối tác',
  TU_CHOI_DOI_TAC: 'Từ chối đối tác',
  DINH_CHI_DOI_TAC: 'Đình chỉ đối tác',

  // ── Tier 3: Operational ────────────────────────────────────────
  DANG_KY_KHACH_HANG: 'Đăng ký khách hàng',
  DANG_KY_DOI_TAC: 'Đăng ký đối tác',
  CAP_NHAT_BANNER: 'Cập nhật banner',
  CAP_NHAT_FAQ: 'Cập nhật FAQ',
  CAP_NHAT_BAI_VIET: 'Cập nhật bài viết',

  // ── Anomaly Alerts ─────────────────────────────────────────────
  CANH_BAO_MUA_HANG: 'Cảnh báo mua hàng',
  CANH_BAO_DANG_NHAP: 'Cảnh báo đăng nhập',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// ── Log Status ───────────────────────────────────────────────────
export const LOG_STATUS = {
  SUCCESS: 'Thành công',
  FAILURE: 'Thất bại',
  WARNING: 'CANH_BAO',
} as const;

// ── User Roles ───────────────────────────────────────────────────
export const ROLES = {
  ADMIN: 'admin',
  PARTNER: 'partner',
  CUSTOMER: 'customer',
} as const;

// ── Anomaly Detection Thresholds ─────────────────────────────────
export const ANOMALY_THRESHOLDS = {
  /**
   * Brute-force login detection
   */
  LOGIN: {
    /** Number of failures before flagging as warning */
    WARN_THRESHOLD: 3,
    /** Number of failures before notifying account owner */
    NOTIFY_THRESHOLD: 5,
    /** Number of failures from same IP (any username) for platform-level alert */
    IP_BLOCK_THRESHOLD: 10,
    /** Time window in minutes to count failures */
    WINDOW_MINUTES: 15,
  },

  /**
   * Customer purchase anomalies
   */
  PURCHASE: {
    /** Max quantity of the same voucher in a single order before flag */
    BULK_QUANTITY: 10,
    /** Max separate orders for the same VoucherID within the time window */
    REPEAT_PURCHASE_COUNT: 5,
    /** Time window for repeat purchase check (hours) */
    REPEAT_PURCHASE_WINDOW_HOURS: 24,
    /** Max orders within the velocity window */
    VELOCITY_ORDER_COUNT: 10,
    /** Velocity check window (minutes) */
    VELOCITY_WINDOW_MINUTES: 30,
    /** Max total value (VND) for a single order before flag */
    HIGH_VALUE_AMOUNT: 5_000_000,
  },
} as const;
