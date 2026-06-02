import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validate.middleware';
import { registerCustomer, registerPartner, login } from '../controllers/auth.controller';

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
    NgaySinh: z.string().optional(),
    GioiTinh: z.string().optional(),
    DiaChi: z.string().optional(),
  }),
});

const registerPartnerSchema = z.object({
  body: z.object({
    TenDangNhap: z.string().min(3),
    MatKhau: passwordRule,
    Email: z.string().email(),
    HoTenNguoiDung: z.string().min(1),
    TenDoanhNghiep: z.string().min(1),
    MaSoThue: z.string().min(1),
    CaNhanDaiDien: z.string().optional(),
    LinhVucKinhDoanh: z.string().optional(),
  }),
});

router.post('/login', validateRequest(loginSchema), login);
router.post('/register/customer', validateRequest(registerCustomerSchema), registerCustomer);
router.post('/register/partner', validateRequest(registerPartnerSchema), registerPartner);

export default router;
