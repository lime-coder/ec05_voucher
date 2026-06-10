import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { VOUCHER_STATUS, ACCOUNT_STATUS, PAYMENT_STATUS } from '../../constants';

export const getAdminNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [pendingPartners, pendingVouchers, paidOrders] = await Promise.all([
      // 1. Pending partners
      prisma.doiTac.findMany({
        where: { TrangThai: ACCOUNT_STATUS.PENDING },
        orderBy: { MaDoiTac: 'desc' },
        take: 5
      }),
      // 2. Pending vouchers
      prisma.voucher.findMany({
        where: { TrangThaiVoucher: VOUCHER_STATUS.PENDING },
        orderBy: { VoucherID: 'desc' },
        take: 5
      }),
      // 3. Paid orders
      prisma.donHang.findMany({
        where: { TrangThaiThanhToan: PAYMENT_STATUS.PAID },
        orderBy: { ThoiGianThanhToan: 'desc' },
        take: 5
      })
    ]);

    const notifications: any[] = [];

    // Map partners
    pendingPartners.forEach(p => {
      notifications.push({
        id: `partner-${p.MaDoiTac}`,
        type: 'alert',
        titleVi: 'Yêu cầu duyệt đối tác mới',
        titleEn: 'New Partner Registration',
        messageVi: `Đối tác "${p.TenDoanhNghiep || 'Chưa rõ'}" đang chờ phê duyệt hồ sơ.`,
        messageEn: `Partner "${p.TenDoanhNghiep || 'Unknown'}" is pending registration approval.`,
        time: 'Gần đây'
      });
    });

    // Map vouchers
    pendingVouchers.forEach(v => {
      notifications.push({
        id: `voucher-${v.VoucherID}`,
        type: 'info',
        titleVi: 'Yêu cầu duyệt Voucher',
        titleEn: 'New Voucher Approval Request',
        messageVi: `Voucher "${v.TenVoucher}" đang chờ duyệt.`,
        messageEn: `Voucher "${v.TenVoucher}" is pending approval.`,
        time: 'Gần đây'
      });
    });

    // Map orders
    paidOrders.forEach(o => {
      notifications.push({
        id: `order-${o.MaDonHang}`,
        type: 'order',
        titleVi: 'Có đơn hàng mới',
        titleEn: 'New Order Received',
        messageVi: `Đơn hàng ORD-${o.MaDonHang} vừa được thanh toán thành công.`,
        messageEn: `Order ORD-${o.MaDonHang} has been successfully paid.`,
        time: 'Gần đây'
      });
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};
