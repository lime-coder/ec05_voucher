import type { CustomerVoucher } from "@voucherhub/types";

export const flashSaleVouchers: CustomerVoucher[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "FOOD",
    name: "Premium Weekend Seafood Buffet for Two",
    partner: "The Grand Waterfront Hotel",
    price: 89,
    originalPrice: 178,
    discount: 50,
    flashDeal: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SPA",
    name: "Grand Bliss Royal Massage & Hydro-Aromatherapy (90 Min)",
    partner: "Ethereal Zen Wellness Spa",
    price: 129,
    originalPrice: 245,
    discount: 47,
    flashDeal: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1762742316793-b1845065429a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc29ydCUyMHZhY2F0aW9uJTIwdHJhdmVsfGVufDF8fHx8MTc3OTM1OTU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "TRAVEL",
    name: "3 Days 2 Nights Resort Package with Breakfast",
    partner: "Paradise Beach Resort & Spa",
    price: 299,
    originalPrice: 599,
    discount: 50,
    flashDeal: true,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwd29ya291dCUyMGV4ZXJjaXNlfGVufDF8fHx8MTc3OTM1OTU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "FITNESS",
    name: "1-Month Premium Gym Membership with Personal Training",
    partner: "FitZone Performance Studio",
    price: 79,
    originalPrice: 199,
    discount: 60,
    flashDeal: true,
  },
];

export interface CartVoucherItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export const cartVouchers: CartVoucherItem[] = [
  {
    id: "1",
    name: "Premium Dining Experience",
    description: "Valid at 50+ locations",
    price: 150.0,
    quantity: 2,
  },
  {
    id: "2",
    name: "Luxury Spa Retreat",
    description: "Full Day Access + Massage",
    price: 299.0,
    quantity: 1,
  },
  {
    id: "3",
    name: "City Tour Pass",
    description: "48-Hour Unlimited Access",
    price: 75.0,
    quantity: 3,
  },
];
