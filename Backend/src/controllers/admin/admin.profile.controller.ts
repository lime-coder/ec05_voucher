import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity } from './index';
import bcrypt from 'bcrypt';

export const getAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await prisma.admin.findFirst({
      include: { TaiKhoan: true }
    });
    if (!admin) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ admin' });
    }
    res.json({
      username: admin.TaiKhoan?.TenDangNhap || 'admin01',
      fullName: admin.TaiKhoan?.HoTenNguoiDung || 'System Administrator',
      email: admin.TaiKhoan?.Email || 'admin@voucher.vn',
      phone: admin.SDT_Admin || '0911111111',
      role: 'System Admin'
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone } = req.body;
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ admin' });
    }

    if (admin.IDTaiKhoan) {
      await prisma.taiKhoan.update({
        where: { IDTaiKhoan: admin.IDTaiKhoan },
        data: {
          HoTenNguoiDung: fullName,
          Email: email
        }
      });
    }

    if (phone && phone !== admin.SDT_Admin) {
      await prisma.$executeRaw`UPDATE Admin SET SDT_Admin = ${phone} WHERE SDT_Admin = ${admin.SDT_Admin}`;
    }

    logActivity(req, 'Cập nhật hồ sơ admin', fullName);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateAdminPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.admin.findFirst({
      include: { TaiKhoan: true }
    });
    if (!admin || !admin.TaiKhoan) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ admin' });
    }

    if (admin.IDTaiKhoan) {
      const isMatch = await bcrypt.compare(currentPassword, admin.TaiKhoan.MatKhau);
      if (!isMatch) {
        return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.taiKhoan.update({
        where: { IDTaiKhoan: admin.IDTaiKhoan },
        data: {
          MatKhau: hashedPassword
        }
      });
    }

    logActivity(req, 'Đổi mật khẩu admin', admin.TaiKhoan.TenDangNhap);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
