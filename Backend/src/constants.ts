// Shared constants for Backend

export const VOUCHER_STATUS = {
  ACTIVE: 'Đang hoạt động',
  PENDING: 'Chờ duyệt',
  PAUSED: 'Tạm ngưng',
  REJECTED: 'Từ chối',
  DELETED: 'Đã xóa',
  DRAFT: 'Bản nháp',
  EXPIRED: 'Hết hạn',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Bị khóa',
  PENDING: 'Chờ duyệt',
  REJECTED: 'Từ chối',
} as const;

export const ORDER_STATUS = {
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
} as const;

export const PAYMENT_STATUS = {
  PAID: 'Đã thanh toán',
  REFUNDED: 'REFUNDED',
} as const;

export const VOUCHER_USAGE_STATUS = {
  UNUSED: 'Chưa sử dụng',
  USED: 'Đã sử dụng',
  EXPIRED: 'Hết hạn',
} as const;
