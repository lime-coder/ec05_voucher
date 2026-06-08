import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { registerCustomer, registerPartner, login, checkAvailability, me } from '../controllers/auth.controller';

const router = Router();

const passwordRule = z.string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số');

const loginSchema = z.object({
  body: z.object({
    TenDangNhap: z.string().min(1),
    MatKhau: z.string().min(1),
  }),
});

const registerCustomerSchema = z.object({
  body: z.object({
    TenDangNhap: z.string().min(3),
    MatKhau: passwordRule,
    Email: z.string().email(),
    HoTenNguoiDung: z.string().min(1),
    SDT: z.string().min(10),
    NgaySinh: z.string().optional().refine((val) => {
      if (!val) return true;
      const dob = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      return age >= 13;
    }, { message: 'You must be at least 13 years old to register' }),
    GioiTinh: z.string().optional(),
    DiaChi: z.string().optional(),
  }),
});

const registerPartnerSchema = z.object({
  body: z.object({
    TenDangNhap: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    MatKhau: passwordRule,
    Email: z.string().email(),
    TenDoanhNghiep: z.string().min(1),
    MaSoThue: z.string().regex(/^\d{10}(\d{3})?$/, 'Tax ID must be 10 or 13 digits'),
    CaNhanDaiDien: z.string().min(1),
    LinhVucKinhDoanh: z.string().min(1),
    ChucVu: z.string().min(1),
  }),
});

const checkAvailabilitySchema = z.object({
  body: z.object({
    username: z.string(),
    email: z.string().email(),
    phone: z.string().optional()
  })
});

router.post('/login', validateRequest(loginSchema), login);
router.post('/check-availability', validateRequest(checkAvailabilitySchema), checkAvailability);
router.post('/register/customer', validateRequest(registerCustomerSchema), registerCustomer);
router.post('/register/partner', validateRequest(registerPartnerSchema), registerPartner);
router.get('/me', requireAuth, me);

export default router;
