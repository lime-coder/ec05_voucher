import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity } from './index';
import { VOUCHER_STATUS } from '../../constants';

export const getAdminVouchers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vouchers = await prisma.voucher.findMany({ include: { DoiTac: true }, orderBy: { VoucherID: 'desc' } });
    const mapped = vouchers.map(v => ({
      id: v.VoucherID,
      name: v.TenVoucher,
      partner: v.DoiTac?.TenDoanhNghiep || 'Đối tác ẩn',
      originalPrice: Number(v.GiaGoc).toLocaleString('vi-VN') + 'đ',
      salePrice: Number(v.GiaBan).toLocaleString('vi-VN') + 'đ',
      quantitySold: v.SoLuongDaBan || 0,
      quantityTotal: v.SoLuongChoPhep,
      description: v.MoTaVoucher,
      conditions: v.MoTaDieuKien,
      usageInstructions: v.HuongDanSuDung,
      refundPolicy: v.ChinhSachHoanTien,
      imageUrl: v.ImageUrl ,
      date: v.ThoiGianBatDau ? new Date(v.ThoiGianBatDau).toLocaleDateString('vi-VN') : '',
      status: v.TrangThaiVoucher === VOUCHER_STATUS.ACTIVE ? 'ACTIVE' :
              v.TrangThaiVoucher === VOUCHER_STATUS.REJECTED ? 'REJECTED' :
              v.TrangThaiVoucher === VOUCHER_STATUS.PAUSED ? 'SUSPENDED' : 'PENDING_APPROVAL'
    }));
    res.json(mapped);
  } catch (error) {
    next(error);
  }
};

export const suspendVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({ where: { VoucherID: Number(id) } });
    if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    if (voucher.TrangThaiVoucher !== VOUCHER_STATUS.ACTIVE) return res.status(400).json({ error: 'Chỉ tạm ngưng được voucher đang ACTIVE' });

    const updated = await prisma.voucher.update({ where: { VoucherID: Number(id) }, data: { TrangThaiVoucher: VOUCHER_STATUS.PAUSED } });
    logActivity(req, `Suspend voucher`, updated.TenVoucher);
    res.json({ ...updated, status: 'SUSPENDED' });
  } catch (error) {
    next(error);
  }
};

export const restoreVoucher = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({ where: { VoucherID: Number(id) } });
    if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    if (voucher.TrangThaiVoucher !== VOUCHER_STATUS.PAUSED && voucher.TrangThaiVoucher !== 'SUSPENDED') return res.status(400).json({ error: 'Chỉ khôi phục được voucher đang bị tạm ngưng' });

    const updated = await prisma.voucher.update({ where: { VoucherID: Number(id) }, data: { TrangThaiVoucher: VOUCHER_STATUS.ACTIVE } });
    logActivity(req, 'Khôi phục voucher', updated.TenVoucher);
    res.json({ ...updated, status: 'ACTIVE' });
  } catch (error) {
    next(error);
  }
};
