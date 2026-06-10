import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { range, startDate, endDate } = req.query;

    const now = new Date();
    let start: Date;
    let end: Date;

    if (range === 'today') {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === '7days') {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === '30days') {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'custom' && startDate && endDate) {
      start = new Date(String(startDate));
      start.setHours(0, 0, 0, 0);
      end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    const orderWhereClause: any = {
      TrangThaiThanhToan: 'Đã thanh toán',
      ThoiGianThanhToan: {
        gte: start,
        lte: end
      }
    };

    const orderFilterClause: any = {
      ThoiGianThanhToan: {
        gte: start,
        lte: end
      }
    };

    const [
      aggregateRevenue,
      tongDonHang,
      tongKhachHang,
      tongDoiTac,
      tongVoucher,
      aggregateSold,
      tongMaPhatHanh,
      tongMaSuDung
    ] = await Promise.all([
      prisma.donHang.aggregate({ _sum: { TongTien: true }, where: orderWhereClause }),
      prisma.donHang.count({ where: orderFilterClause }),
      prisma.khachHang.count(),
      prisma.doiTac.count(),
      prisma.voucher.count(),
      prisma.chiTietDonHang.aggregate({ _sum: { SoLuongMua: true }, where: { DonHang: orderWhereClause } }),
      prisma.maVoucher.count({ where: { ThoiDiemPhatHanh: { gte: start, lte: end } } }),
      prisma.maVoucher.count({ where: { TrangThaiSuDung: 'Đã sử dụng', ThoiDiemSuDung: { gte: start, lte: end } } })
    ]);

    const tongDoanhThu = Number(aggregateRevenue._sum.TongTien || 0);
    const tongVoucherDaBan = Number(aggregateSold._sum.SoLuongMua || 0);

    const periodLength = end.getTime() - start.getTime() + 1;
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(start.getTime() - periodLength);

    const prevOrderWhereClause: any = { TrangThaiThanhToan: 'Đã thanh toán', ThoiGianThanhToan: { gte: prevStart, lte: prevEnd } };
    const prevOrderFilterClause: any = { ThoiGianThanhToan: { gte: prevStart, lte: prevEnd } };

    const [prevRevAggregate, prevDonHang, prevSoldAggregate, prevIssuedCodes, prevUsedCodes] = await Promise.all([
      prisma.donHang.aggregate({ _sum: { TongTien: true }, where: prevOrderWhereClause }),
      prisma.donHang.count({ where: prevOrderFilterClause }),
      prisma.chiTietDonHang.aggregate({ _sum: { SoLuongMua: true }, where: { DonHang: prevOrderWhereClause } }),
      prisma.maVoucher.count({ where: { ThoiDiemPhatHanh: { gte: prevStart, lte: prevEnd } } }),
      prisma.maVoucher.count({ where: { TrangThaiSuDung: 'Đã sử dụng', ThoiDiemSuDung: { gte: prevStart, lte: prevEnd } } }),
    ]);

    const prevDoanhThu = Number(prevRevAggregate._sum.TongTien || 0);
    const prevDonHangCount = prevDonHang;
    const prevVoucherDaBan = Number(prevSoldAggregate._sum.SoLuongMua || 0);

    const recentPaidOrders = await prisma.donHang.findMany({
      where: orderWhereClause,
      select: { ThoiGianThanhToan: true, TongTien: true }
    });

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let doanhThuTheoNgay: { date: string; revenue: number }[] = [];
    let revenueGranularity: 'day' | 'week' | 'month' = 'day';

    if (diffDays <= 31) {
      revenueGranularity = 'day';
      const revenueMap: { [key: string]: number } = {};
      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        revenueMap[key] = 0;
      }
      recentPaidOrders.forEach(order => {
        if (order.ThoiGianThanhToan) {
          const dateObj = new Date(order.ThoiGianThanhToan);
          const key = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
          if (revenueMap[key] !== undefined) {
            revenueMap[key] += Number(order.TongTien || 0);
          }
        }
      });
      doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    } else if (diffDays <= 180) {
      revenueGranularity = 'week';
      const revenueMap: { [key: string]: number } = {};
      
      const getWeekKey = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        return `Tuần ${String(weekStart.getDate()).padStart(2, '0')}/${String(weekStart.getMonth() + 1).padStart(2, '0')}`;
      };

      let current = new Date(start);
      while (current <= end) {
        const key = getWeekKey(current);
        revenueMap[key] = 0;
        current.setDate(current.getDate() + 7);
      }
      const endKey = getWeekKey(end);
      revenueMap[endKey] = 0;

      recentPaidOrders.forEach(order => {
        if (order.ThoiGianThanhToan) {
          const key = getWeekKey(new Date(order.ThoiGianThanhToan));
          if (revenueMap[key] !== undefined) {
            revenueMap[key] += Number(order.TongTien || 0);
          }
        }
      });
      doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    } else {
      revenueGranularity = 'month';
      const revenueMap: { [key: string]: number } = {};
      
      const getMonthKey = (date: Date) => {
        return `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      };

      let current = new Date(start);
      while (current <= end) {
        const key = getMonthKey(current);
        revenueMap[key] = 0;
        current.setMonth(current.getMonth() + 1);
      }
      const endKey = getMonthKey(end);
      revenueMap[endKey] = 0;

      recentPaidOrders.forEach(order => {
        if (order.ThoiGianThanhToan) {
          const key = getMonthKey(new Date(order.ThoiGianThanhToan));
          if (revenueMap[key] !== undefined) {
            revenueMap[key] += Number(order.TongTien || 0);
          }
        }
      });
      doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    }

    const topVouchersRaw = await prisma.chiTietDonHang.groupBy({
      by: ['VoucherID'],
      _sum: { SoLuongMua: true },
      where: { DonHang: orderWhereClause },
      orderBy: { _sum: { SoLuongMua: 'desc' } },
      take: 5
    });

    const topVouchers = await Promise.all(
      topVouchersRaw.map(async item => {
        let name = `Voucher #${item.VoucherID}`;
        if (item.VoucherID) {
          const v = await prisma.voucher.findUnique({ where: { VoucherID: item.VoucherID } });
          if (v) name = v.TenVoucher;
        }
        return { name, sales: Number(item._sum.SoLuongMua || 0) };
      })
    );

    const recentOrdersRaw = await prisma.donHang.findMany({
      where: orderFilterClause,
      orderBy: { MaDonHang: 'desc' },
      take: 5,
      include: { TaiKhoan: true }
    });

    const recentOrders = recentOrdersRaw.map(o => {
      let orderStatus = 'PENDING';
      if (o.TrangThaiThanhToan === 'Đã thanh toán') orderStatus = 'PAID';
      else if (o.TrangThaiThanhToan === 'Đã hoàn tiền' || o.TrangThaiThanhToan === 'REFUNDED') orderStatus = 'REFUNDED';
      else if (o.TrangThaiDonHang === 'Đã hủy' || o.TrangThaiDonHang === 'CANCELLED') orderStatus = 'CANCELLED';

      const timeStr = o.ThoiGianThanhToan
        ? new Date(o.ThoiGianThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(o.ThoiGianThanhToan).toLocaleDateString('vi-VN')
        : '';
      return {
        id: `ORD-${o.MaDonHang}`,
        customer: o.TaiKhoan?.HoTenNguoiDung || o.TaiKhoan?.TenDangNhap || 'Khách vãng lai',
        total: Number(o.TongTien || 0).toLocaleString('vi-VN') + 'đ',
        status: orderStatus,
        time: timeStr
      };
    });

    res.json({
      tongDoanhThu,
      tongDonHang,
      tongKhachHang,
      tongDoiTac,
      tongVoucher,
      tongVoucherDaBan,
      tongMaPhatHanh,
      tongMaSuDung,
      prevDoanhThu,
      prevDonHang: prevDonHangCount,
      prevVoucherDaBan,
      prevKhachHang: null,
      prevDoiTac: null,
      prevVoucher: null,
      prevMaPhatHanh: prevIssuedCodes,
      prevMaSuDung: prevUsedCodes,
      revenueGranularity,
      doanhThuTheoNgay,
      topVouchers,
      recentOrders
    });
  } catch (error) {
    next(error);
  }
};
