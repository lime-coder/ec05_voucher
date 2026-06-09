import { Request, Response } from 'express';
import prisma from '../config/db';
import * as bcrypt from 'bcrypt';
import { LogService } from '../services/log.service';
import { AUDIT_ACTIONS, LOG_STATUS } from '../config/audit.config';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });

    const { fullName, phone, address, dob, gender, email } = req.body;

    const existingUser = await prisma.taiKhoan.findUnique({
      where: { IDTaiKhoan: customerId }
    });

    if (!existingUser) return res.status(404).json({ message: 'error.user_not_found' });

    // Cập nhật thông tin tài khoản và thông tin khách hàng bằng transaction
    await prisma.$transaction(async (tx) => {
      await tx.taiKhoan.update({
        where: { IDTaiKhoan: customerId },
        data: {
          HoTenNguoiDung: fullName,
          Email: email,
        }
      });

      // Kiểm tra xem khách hàng đã có thông tin chi tiết chưa
      const khachHang = await tx.khachHang.findUnique({
        where: { IDTaiKhoan: customerId }
      });

      if (khachHang) {
        await tx.khachHang.update({
          where: { IDTaiKhoan: customerId },
          data: {
            SDT_KH: phone,
            DiaChiKhachHang: address,
            GioiTinh: gender,
            NgaySinh: dob ? new Date(dob) : null,
          }
        });
      } else {
        await tx.khachHang.create({
          data: {
            IDTaiKhoan: customerId,
            SDT_KH: phone,
            DiaChiKhachHang: address,
            GioiTinh: gender,
            NgaySinh: dob ? new Date(dob) : null,
          }
        });
      }
    });

    await LogService.createLog({
      IDTaiKhoan: customerId,
      HanhDong: 'Cập nhật hồ sơ' as any,
      DoiTuong: existingUser.TenDangNhap,
      ChiTiet: `Khách hàng cập nhật thông tin cá nhân.`,
      DiaChiIP: req.ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    res.json({ message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi cập nhật hồ sơ:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'error.missing_passwords' });
    }

    const user = await prisma.taiKhoan.findUnique({
      where: { IDTaiKhoan: customerId }
    });

    if (!user) return res.status(404).json({ message: 'error.user_not_found' });

    const isMatch = await bcrypt.compare(currentPassword, user.MatKhau);
    if (!isMatch) {
      await LogService.createLog({
        IDTaiKhoan: customerId,
        HanhDong: AUDIT_ACTIONS.THAY_DOI_MAT_KHAU,
        DoiTuong: user.TenDangNhap,
        ChiTiet: 'Thay đổi mật khẩu thất bại: Sai mật khẩu cũ.',
        DiaChiIP: req.ip,
        TrangThai: LOG_STATUS.FAILURE,
      });
      return res.status(400).json({ message: 'error.old_password_incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'error.pwd_length' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'error.pwd_upper' });
    }
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ message: 'error.pwd_lower' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'error.pwd_digit' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.taiKhoan.update({
      where: { IDTaiKhoan: customerId },
      data: { MatKhau: hashedPassword }
    });

    await LogService.createLog({
      IDTaiKhoan: customerId,
      HanhDong: AUDIT_ACTIONS.THAY_DOI_MAT_KHAU,
      DoiTuong: user.TenDangNhap,
      ChiTiet: 'Thay đổi mật khẩu thành công.',
      DiaChiIP: req.ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};
