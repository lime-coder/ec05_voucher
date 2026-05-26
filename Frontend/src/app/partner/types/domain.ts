import type { ChipProps } from '@mui/material';

export type ViewId =
  | 'dashboard'
  | 'vouchers'
  | 'create'
  | 'verify'
  | 'reports'
  | 'branches'
  | 'profile';

export type VoucherStatus = 'active' | 'pending' | 'paused' | 'expired';

export interface Voucher {
  id: string;
  name: string;
  categories: string[];
  originalPrice: number;
  salePrice: number;
  discount: number;
  quantity: number;
  sold: number;
  status: VoucherStatus;
  validFrom: string;
  validTo: string;
  branches?: string[];
}

export interface StatusConfig {
  label: string;
  color: ChipProps['color'];
}

export type VerificationStatus = 'valid' | 'used' | 'expired' | 'invalid';

export interface VoucherCode {
  code: string;
  voucherName: string;
  customerName: string;
  customerPhone: string;
  originalPrice: number;
  salePrice: number;
  purchaseDate: string;
  validUntil: string;
  status: VerificationStatus;
  usedDate?: string;
  branch?: string;
}

export interface RecentVerification {
  code: string;
  voucherName: string;
  time: string;
  status: 'verified' | 'rejected';
  branch?: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface BusinessProfile {
  businessName: string;
  businessType: string;
  taxCode: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
}

export interface ImageItem {
  id: string;
  url: string;
  description: string;
}

export interface CreateVoucherFormData {
  name: string;
  categories: string[];
  description: string;
  terms: string;
  originalPrice: string;
  salePrice: string;
  
  quantity: string;
  branches: string[];
  saleStartDate: string;
  saleEndDate: string;
  validStartDate: string;
  validEndDate: string;
  
  
  isRefundable: boolean;
  refundPolicy: string;
  dateSetBy: 'partner' | 'admin' | 'system';
}
