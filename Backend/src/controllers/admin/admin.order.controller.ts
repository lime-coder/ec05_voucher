import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity } from './index';

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where: any = {};
    if (startDate && endDate) {
      where.ThoiGianThanhToan = { gte: new Date(String(startDate) + 'T00:00:00'), lte: new Date(String(endDate) + 'T23:59:59') };
    }
    if (status === 'PAID') where.TrangThaiThanhToan = 'PAID';
    else if (status === 'REFUNDED') where.TrangThaiThanhToan = 'REFUNDED';
    else if (status === 'CANCELLED') where.TrangThaiDonHang = 'CANCELLED';
    else if (status === 'PENDING') where.TrangThaiThanhToan = { notIn: ['PAID', 'REFUNDED'] };

    const orders = await prisma.donHang.findMany({
      where,
      include: { TaiKhoan: true, ChiTietDonHangs: { include: { Voucher: true } } },
      orderBy: { MaDonHang: 'desc' }
    });

    const mapped = orders.map(o => {
      const dateStr = o.ThoiGianThanhToan ? new Date(o.ThoiGianThanhToan).toLocaleDateString('vi-VN') + ' ' + new Date(o.ThoiGianThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa thanh toán';
      let orderStatus = 'PENDING';
      if (o.TrangThaiThanhToan === 'Đã thanh toán') orderStatus = 'PAID';
      else if (o.TrangThaiThanhToan === 'REFUNDED') orderStatus = 'REFUNDED';
      else if (o.TrangThaiDonHang === 'Đã hủy') orderStatus = 'CANCELLED';

      // Fix giá 0đ: fallback sang GiaBan của Voucher nếu DonGia null
      const items = o.ChiTietDonHangs.map(item => ({
        voucherId: item.VoucherID,
        name: item.Voucher?.TenVoucher || `Voucher #${item.VoucherID}`,
        quantity: item.SoLuongMua || 1,
        price: Number(item.DonGia ?? item.Voucher?.GiaBan ?? 0).toLocaleString('vi-VN') + 'đ'
      }));

      return { id: `ORD-${o.MaDonHang}`, rawId: o.MaDonHang, customer: o.TaiKhoan?.HoTenNguoiDung || o.TaiKhoan?.TenDangNhap || 'Khách vãng lai', customerEmail: o.TaiKhoan?.Email || '', total: Number(o.TongTien || 0).toLocaleString('vi-VN') + 'đ', payment: o.PhuongThucThanhToan || '', status: orderStatus, date: dateStr, items };
    });

    res.json(mapped);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.donHang.findUnique({
      where: { MaDonHang: Number(id) },
      include: { ChiTietDonHangs: { include: { MaVouchers: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    if (status === 'REFUNDED') {
      // Chặn hoàn tiền nếu có mã voucher đã dùng
      const allCodes = order.ChiTietDonHangs.flatMap(ct => ct.MaVouchers);
      const hasUsed = allCodes.some(mv => mv.TrangThaiSuDung === 'Đã sử dụng');
      if (hasUsed) return res.status(400).json({ error: 'Không thể hoàn tiền: có mã voucher đã được sử dụng trong đơn hàng này.' });

      // Hủy toàn bộ mã voucher
      await prisma.maVoucher.updateMany({
        where: { SoMaVoucher: { in: allCodes.map(mv => mv.SoMaVoucher) } },
        data: { TrangThaiSuDung: 'Hủy voucher' }
      });
      await prisma.donHang.update({ where: { MaDonHang: Number(id) }, data: { TrangThaiThanhToan: 'REFUNDED', TrangThaiDonHang: 'Đã hủy' } });
      logActivity(req, `Refund ORD-${id}`, `${allCodes.length} voucher codes → Hủy voucher`);
      return res.json({ message: 'Hoàn tiền thành công, các mã voucher đã được hủy.' });
    }

    let data: any = {};
    if (status === 'PAID') data = { TrangThaiThanhToan: 'Đã thanh toán', TrangThaiDonHang: 'Hoàn tất', ThoiGianThanhToan: new Date() };
    else if (status === 'CANCELLED') data = { TrangThaiDonHang: 'Đã hủy' };
    else return res.status(400).json({ error: 'Trạng thái không hợp lệ' });

    const updated = await prisma.donHang.update({ where: { MaDonHang: Number(id) }, data });
    logActivity(req, `Update ORD-${id}`, `Status: ${status}`);
    res.json({ message: 'Updated successfully', order: updated });
  } catch (error) {
    next(error);
  }
};
