import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity } from './index';
import { ACCOUNT_STATUS } from '../../constants';

const checkIsLocked = (statusStr: string | null | undefined): boolean => {
  if (!statusStr) return false;
  const s = statusStr.trim();
  const normalizedS = s.normalize('NFC');
  const normalizedNFD = s.normalize('NFD');
  const upper = s.toUpperCase();
  
  return upper === 'LOCKED' || 
         upper === 'INACTIVE' || 
         upper === 'BỊ KHÓA' || 
         normalizedS === 'Bị khóa' ||
         normalizedNFD === 'Bị khóa'.normalize('NFD');
};

const checkIsPending = (statusStr: string | null | undefined): boolean => {
  if (!statusStr) return false;
  const s = statusStr.trim();
  const normalizedS = s.normalize('NFC');
  const normalizedNFD = s.normalize('NFD');
  const upper = s.toUpperCase();
  
  return upper === 'PENDING' || 
         upper === 'CHỜ DUYỆT' || 
         normalizedS === 'Chờ duyệt' ||
         normalizedNFD === 'Chờ duyệt'.normalize('NFD');
};

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

      let status: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
      if (checkIsLocked(u.TrangThaiTaiKhoan)) status = 'INACTIVE';
      else if (checkIsPending(u.TrangThaiTaiKhoan)) status = 'PENDING';

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
          if (checkIsLocked(u.TrangThaiTaiKhoan)) {
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

    let derivedStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
    if (checkIsLocked(user.TrangThaiTaiKhoan)) derivedStatus = 'INACTIVE';
    else if (checkIsPending(user.TrangThaiTaiKhoan)) derivedStatus = 'PENDING';

    if (user.NhanVienDoiTacs?.length > 0 && user.NhanVienDoiTacs[0]?.DoiTac) {
      const pt = user.NhanVienDoiTacs[0].DoiTac;
      if (pt.TrangThai === ACCOUNT_STATUS.PENDING) {
        derivedStatus = 'PENDING';
      } else if (pt.TrangThai === ACCOUNT_STATUS.REJECTED || pt.TrangThai === ACCOUNT_STATUS.LOCKED) {
        derivedStatus = 'INACTIVE';
      } else if (pt.TrangThai === ACCOUNT_STATUS.ACTIVE) {
        if (checkIsLocked(user.TrangThaiTaiKhoan)) {
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
