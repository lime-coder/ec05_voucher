import type { CustomerVoucher } from "@voucherhub/types";

export const flashSaleVouchers: CustomerVoucher[] = [];

export interface CartVoucherItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export const cartVouchers: CartVoucherItem[] = [];

