import type {
  Branch,
  BusinessProfile,
  CreateVoucherFormData,
  RecentVerification,
  StatusConfig,
  Voucher,
  VoucherCode,
  VoucherStatus,
} from '../types/domain';

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

export const partnerBranches = [
  'Chi nhánh Quận 1 - 123 Nguyễn Huệ',
  'Chi nhánh Quận 3 - 456 Lê Văn Sỹ',
  'Chi nhánh Quận 7 - 789 Nguyễn Hữu Thọ',
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
  
  
  isRefundable: true,
  refundPolicy: '',
  dateSetBy: 'partner',
};

export const vouchers: Voucher[] = [
  {
    id: 'VC001',
    name: 'Buffet Hải sản cao cấp - All you can eat',
    categories: ['Ẩm thực'],
    originalPrice: 500000,
    salePrice: 250000,
    discount: 50,
    quantity: 500,
    sold: 245,
    status: 'active',
    validFrom: '2026-01-01',
    validTo: '2026-06-30',
    branches: ['Chi nhánh Quận 1', 'Chi nhánh Quận 3'],
  },
  {
    id: 'VC002',
    name: 'Spa & Massage trọn gói 90 phút',
    categories: ['Làm đẹp', 'Sức khỏe'],
    originalPrice: 300000,
    salePrice: 150000,
    discount: 50,
    quantity: 300,
    sold: 189,
    status: 'active',
    validFrom: '2026-01-15',
    validTo: '2026-07-15',
    branches: ['Chi nhánh Quận 7'],
  },
  {
    id: 'VC003',
    name: 'Khóa học Yoga 1 tháng - 12 buổi',
    categories: ['Sức khỏe', 'Giáo dục'],
    originalPrice: 300000,
    salePrice: 150000,
    discount: 50,
    quantity: 200,
    sold: 98,
    status: 'pending',
    validFrom: '2026-02-01',
    validTo: '2026-08-01',
    branches: ['Chi nhánh Quận 1'],
  },
  {
    id: 'VC004',
    name: 'Combo 2 vé xem phim CGV',
    categories: ['Giải trí'],
    originalPrice: 200000,
    salePrice: 120000,
    discount: 40,
    quantity: 1000,
    sold: 756,
    status: 'active',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    branches: ['Chi nhánh Quận 1', 'Chi nhánh Quận 3', 'Chi nhánh Quận 7'],
  },
  {
    id: 'VC005',
    name: 'Ăn tối lãng mạn 2 người tại nhà hàng',
    categories: ['Ẩm thực'],
    originalPrice: 300000,
    salePrice: 180000,
    discount: 40,
    quantity: 200,
    sold: 142,
    status: 'paused',
    validFrom: '2026-01-10',
    validTo: '2026-05-10',
    branches: ['Chi nhánh Quận 1'],
  },
];

export const voucherStatusConfig: Record<VoucherStatus, StatusConfig> = {
  active: { label: 'Đang bán', color: 'success' },
  pending: { label: 'Chờ duyệt', color: 'warning' },
  paused: { label: 'Tạm dừng', color: 'default' },
  expired: { label: 'Hết hạn', color: 'error' },
};

export const dashboardStats = [
  {
    title: 'Tổng doanh thu tháng này',
    value: '125,500,000₫',
    change: '+12.5%',
    icon: 'money',
    color: '#4caf50',
  },
  {
    title: 'Voucher đang bán',
    value: '24',
    change: '+3',
    icon: 'voucher',
    color: '#2196f3',
  },
  {
    title: 'Đã sử dụng',
    value: '1,245',
    change: '+18.2%',
    icon: 'check',
    color: '#ff9800',
  },
  {
    title: 'Chờ duyệt',
    value: '5',
    change: '2 mới',
    icon: 'schedule',
    color: '#f44336',
  },
] as const;

export const salesData = [
  { month: 'T1', revenue: 45, vouchers: 320 },
  { month: 'T2', revenue: 52, vouchers: 380 },
  { month: 'T3', revenue: 48, vouchers: 350 },
  { month: 'T4', revenue: 61, vouchers: 420 },
  { month: 'T5', revenue: 75, vouchers: 520 },
  { month: 'T6', revenue: 85, vouchers: 610 },
];

export const topVouchers = [
  { name: 'Giảm 50% Buffet Hải sản', sold: 245, revenue: 36750000 },
  { name: 'Spa & Massage trọn gói', sold: 189, revenue: 28350000 },
  { name: 'Combo 2 vé Gym 3 tháng', sold: 156, revenue: 23400000 },
  { name: 'Ăn tối lãng mạn 2 người', sold: 142, revenue: 21300000 },
  { name: 'Khóa học Yoga 1 tháng', sold: 98, revenue: 14700000 },
];

export const recentActivities = [
  { text: 'Voucher "Spa Premium" đã được duyệt', time: '5 phút trước', type: 'success' },
  { text: '12 voucher mới được bán ra', time: '1 giờ trước', type: 'info' },
  { text: 'Khách hàng đánh giá 5⭐', time: '2 giờ trước', type: 'success' },
  { text: 'Cần cập nhật giá voucher "Buffet"', time: '3 giờ trước', type: 'warning' },
  { text: '23 voucher đã được sử dụng hôm nay', time: '5 giờ trước', type: 'info' },
] as const;

export const revenueData = [
  { month: 'T1', revenue: 45, target: 50 },
  { month: 'T2', revenue: 52, target: 55 },
  { month: 'T3', revenue: 48, target: 60 },
  { month: 'T4', revenue: 61, target: 65 },
  { month: 'T5', revenue: 75, target: 70 },
  { month: 'T6', revenue: 85, target: 80 },
];

export const reportStats = [
  {
    id: 'revenue',
    title: 'Tổng doanh thu',
    value: '327.5M₫',
    change: '+24.5%',
    icon: 'money',
    color: '#2196f3',
    background: '#e3f2fd',
    trend: 'up',
  },
  {
    id: 'sold',
    title: 'Voucher đã bán',
    value: '2,185',
    change: '+18.2%',
    icon: 'voucher',
    color: '#4caf50',
    background: '#e8f5e9',
    trend: 'up',
  },
  {
    id: 'customers',
    title: 'Khách hàng mới',
    value: '1,456',
    change: '+12.8%',
    icon: 'people',
    color: '#ff9800',
    background: '#fff3e0',
    trend: 'up',
  },
  {
    id: 'rating',
    title: 'Đánh giá trung bình',
    value: '4.6/5',
    change: '-2.3%',
    icon: 'star',
    color: '#e91e63',
    background: '#fce4ec',
    trend: 'down',
  },
] as const;

export const topCustomers = [
  { name: 'Nguyễn Văn A', purchases: 15, spent: 4500000 },
  { name: 'Trần Thị B', purchases: 12, spent: 3600000 },
  { name: 'Lê Văn C', purchases: 10, spent: 3000000 },
  { name: 'Phạm Thị D', purchases: 8, spent: 2400000 },
  { name: 'Hoàng Văn E', purchases: 7, spent: 2100000 },
];

export const recentVerifications: RecentVerification[] = [
  {
    code: 'VC001-ABC123',
    voucherName: 'Buffet Hải sản',
    time: '10:30 AM',
    status: 'verified',
    branch: 'Chi nhánh Quận 1'
  },
  {
    code: 'VC002-DEF456',
    voucherName: 'Spa Premium',
    time: '11:15 AM',
    status: 'verified',
    branch: 'Chi nhánh Quận 7'
  },
  {
    code: 'VC003-GHI789',
    voucherName: 'Gym 3 tháng',
    time: '12:00 PM',
    status: 'rejected',
    branch: 'Chi nhánh Quận 3'
  },
];

export const voucherCodeLookup: Record<string, VoucherCode> = {
  'VC001-ABC123': {
    code: 'VC001-ABC123',
    voucherName: 'Buffet Hải sản cao cấp - All you can eat',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    originalPrice: 500000,
    salePrice: 250000,
    purchaseDate: '2026-05-15',
    validUntil: '2026-06-30',
    status: 'valid',
    branch: 'Chi nhánh Quận 1',
  },
  'VC002-USED': {
    code: 'VC002-USED',
    voucherName: 'Spa & Massage trọn gói',
    customerName: 'Trần Thị B',
    customerPhone: '0907654321',
    originalPrice: 300000,
    salePrice: 150000,
    purchaseDate: '2026-05-10',
    validUntil: '2026-07-15',
    status: 'used',
    usedDate: '2026-05-18',
    branch: 'Chi nhánh Quận 3',
  },
};

export const initialBusinessProfile: BusinessProfile = {
  businessName: 'Nhà hàng Biển Đông',
  businessType: 'Nhà hàng - Ẩm thực',
  taxCode: '0123456789',
  email: 'contact@bienodng.vn',
  phone: '028 1234 5678',
  website: 'https://biendong.vn',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  representativeName: 'Nguyễn Văn A',
  representativePhone: '0901234567',
  representativeEmail: 'nguyenvana@biendong.vn',
};

export const branches: Branch[] = [
  {
    id: 1,
    name: 'Chi nhánh Quận 1',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    phone: '028 1234 5678',
    status: 'active',
  },
  {
    id: 2,
    name: 'Chi nhánh Quận 3',
    address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
    phone: '028 2345 6789',
    status: 'active',
  },
  {
    id: 3,
    name: 'Chi nhánh Quận 7',
    address: '789 Nguyễn Hữu Thọ, Quận 7, TP.HCM',
    phone: '028 3456 7890',
    status: 'inactive',
  },
];
