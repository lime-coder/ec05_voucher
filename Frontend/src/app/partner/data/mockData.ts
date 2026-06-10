import type {
  BusinessProfile,
  CreateVoucherFormData,
  StatusConfig,
  VoucherStatus,
} from '@voucherhub/types';

export const voucherCategories = [
  'Ẩm thực',
  'Làm đẹp',
  'Sức khỏe',
  'Giải trí',
  'Du lịch',
  'Mua sắm',
  'Giáo dục',
  'Khác',
];

export const initialCreateVoucherForm: CreateVoucherFormData = {
  name: '',
  categories: [],
  description: '',
  terms: '',
  originalPrice: '',
  salePrice: '',
  discountPercent: '',
  quantity: '',
  branches: [],
  saleStartDate: '',
  saleEndDate: '',
  validStartDate: '',
  validEndDate: '',
  isRefundable: false,
  refundPolicy: '',
  usageInstructions: '',
  dateSetBy: 'partner',
};

export const voucherStatusConfig: Record<VoucherStatus, StatusConfig> = {
  active: { label: 'Đang bán', color: 'success' },
  pending: { label: 'Chờ duyệt', color: 'warning' },
  paused: { label: 'Tạm dừng', color: 'default' },
  expired: { label: 'Hết hạn', color: 'error' },
  draft: { label: 'Bản nháp', color: 'default' },
  rejected: { label: 'Bị từ chối', color: 'error' },
  deleted: { label: 'Đã xóa', color: 'error' },
};

export const initialBusinessProfile: BusinessProfile = {
  businessName: '',
  businessType: '',
  taxCode: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  representativeName: '',
  representativePhone: '',
  representativeEmail: '',
};
