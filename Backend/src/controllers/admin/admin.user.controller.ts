import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity } from './index';
import { ACCOUNT_STATUS } from '../../constants';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accounts = await prisma.taiKhoan.findMany({
      include: {
        KhachHang: true,
        Admin: true,
        NhanVienDoiTacs: { include: { DoiTac: true } }
      }
    });

    const mapped = accounts.map(u => {
      const phone = u.KhachHang?.SDT_KH || u.Admin?.SDT_Admin || '';

      const dbStatus = (u.TrangThaiTaiKhoan || '').trim().toUpperCase();
      let status: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
      if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') status = 'INACTIVE';
      else if (dbStatus === 'PENDING' || dbStatus === 'CHỜ DUYỆT') status = 'PENDING';

      let accountType: 'Admin' | 'Partner' | 'Customer' = 'Customer';
      if (u.Admin) accountType = 'Admin';
      else if (u.NhanVienDoiTacs?.length > 0) accountType = 'Partner';

      const partnerStatus = u.NhanVienDoiTacs?.[0]?.DoiTac?.TrangThai || null;

      if (accountType === 'Partner' && u.NhanVienDoiTacs?.[0]?.DoiTac) {
        const pt = u.NhanVienDoiTacs[0].DoiTac;
        if (pt.TrangThai === ACCOUNT_STATUS.PENDING) {
          status = 'PENDING';
        } else if (pt.TrangThai === ACCOUNT_STATUS.REJECTED || pt.TrangThai === ACCOUNT_STATUS.LOCKED) {
          status = 'INACTIVE';
        } else if (pt.TrangThai === ACCOUNT_STATUS.ACTIVE) {
          if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') {
            status = 'INACTIVE';
          } else {
            status = 'ACTIVE';
          }
        }
      }
      return { id: u.IDTaiKhoan, name: u.HoTenNguoiDung || u.TenDangNhap, username: u.TenDangNhap, email: u.Email, phone, status, accountType, partnerStatus, date: '15/03/2026' };
    });

    res.json(mapped);
  } catch (error) {
    next(error);
  }
};

export const toggleUserActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await prisma.taiKhoan.findUnique({
      where: { IDTaiKhoan: Number(id) },
      include: { NhanVienDoiTacs: { include: { DoiTac: true } } }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    if (user.NhanVienDoiTacs?.length > 0) {
      const pStatus = user.NhanVienDoiTacs[0]?.DoiTac?.TrangThai;
      if (pStatus === 'PENDING') {
        return res.status(400).json({ error: 'Không thể khóa tài khoản Đối tác đang ở trạng thái Chờ duyệt (PENDING).' });
      }
    }

    const dbStatus = (user.TrangThaiTaiKhoan || '').trim().toUpperCase();
    let derivedStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
    if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') derivedStatus = 'INACTIVE';
    else if (dbStatus === 'PENDING' || dbStatus === 'CHỜ DUYỆT') derivedStatus = 'PENDING';

    if (user.NhanVienDoiTacs?.length > 0 && user.NhanVienDoiTacs[0]?.DoiTac) {
      const pt = user.NhanVienDoiTacs[0].DoiTac;
      if (pt.TrangThai === ACCOUNT_STATUS.PENDING) {
        derivedStatus = 'PENDING';
      } else if (pt.TrangThai === ACCOUNT_STATUS.REJECTED || pt.TrangThai === ACCOUNT_STATUS.LOCKED) {
        derivedStatus = 'INACTIVE';
      } else if (pt.TrangThai === ACCOUNT_STATUS.ACTIVE) {
        if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') {
          derivedStatus = 'INACTIVE';
        } else {
          derivedStatus = 'ACTIVE';
        }
      }
    }

    if (derivedStatus === 'PENDING') {
      return res.status(400).json({ error: 'Không thể khóa tài khoản đang ở trạng thái Chờ duyệt (PENDING).' });
    }

    const nextDbStatus = derivedStatus === 'ACTIVE' ? ACCOUNT_STATUS.LOCKED : ACCOUNT_STATUS.ACTIVE;
    const updated = await prisma.taiKhoan.update({ where: { IDTaiKhoan: Number(id) }, data: { TrangThaiTaiKhoan: nextDbStatus } });
    logActivity(req, nextDbStatus === ACCOUNT_STATUS.LOCKED ? 'Lock account' : 'Unlock account', updated.HoTenNguoiDung || updated.TenDangNhap);
    res.json({ id: updated.IDTaiKhoan, status: derivedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
  } catch (error) {
    next(error);
  }
};
