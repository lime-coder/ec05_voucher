// Constants and helpers for database constraints validation and normalization

// 1. Gender mapping (DB constraint: 'Nam', 'Nữ', 'Khác')
export const GENDER_MAP: Record<string, string> = {
  'male': 'Nam',
  'female': 'Nữ',
  'other': 'Khác',
  'prefer_not_say': 'Khác',
  'nam': 'Nam',
  'nữ': 'Nữ',
  'nu': 'Nữ',
  'khác': 'Khác',
  'khac': 'Khác',
};

export function normalizeGender(gender: string | null | undefined): string | null {
  if (!gender) return null;
  const normalized = gender.trim().toLowerCase();
  return GENDER_MAP[normalized] || 'Khác';
}

// 2. Order Status mapping (DB constraint: 'Đã hủy', 'Hoàn tất', 'Chờ xử lý')
export const ORDER_STATUS_MAP: Record<string, string> = {
  'pending': 'Chờ xử lý',
  'completed': 'Hoàn tất',
  'paid': 'Hoàn tất',
  'cancelled': 'Đã hủy',
  'refunded': 'Đã hủy',
  'chờ xử lý': 'Chờ xử lý',
  'cho xu ly': 'Chờ xử lý',
  'hoàn tất': 'Hoàn tất',
  'hoan tat': 'Hoàn tất',
  'đã hủy': 'Đã hủy',
  'da huy': 'Đã hủy',
};

export function normalizeOrderStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  const normalized = status.trim().toLowerCase();
  return ORDER_STATUS_MAP[normalized] || 'Chờ xử lý';
}

// 3. Payment Status mapping (DB constraint: 'Thất bại', 'Đã hoàn tiền', 'Đã thanh toán', 'Chưa thanh toán')
export const PAYMENT_STATUS_MAP: Record<string, string> = {
  'pending': 'Chưa thanh toán',
  'unpaid': 'Chưa thanh toán',
  'paid': 'Đã thanh toán',
  'refunded': 'Đã hoàn tiền',
  'failed': 'Thất bại',
  'chưa thanh toán': 'Chưa thanh toán',
  'chua thanh toan': 'Chưa thanh toán',
  'đã thanh toán': 'Đã thanh toán',
  'da thanh toan': 'Đã thanh toán',
  'đã hoàn tiền': 'Đã hoàn tiền',
  'da hoan tien': 'Đã hoàn tiền',
  'thất bại': 'Thất bại',
  'that bai': 'Thất bại',
};

export function normalizePaymentStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  const normalized = status.trim().toLowerCase();
  return PAYMENT_STATUS_MAP[normalized] || 'Chưa thanh toán';
}
