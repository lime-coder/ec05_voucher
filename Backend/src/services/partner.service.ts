import prisma from '../config/db';

export class PartnerService {
  /**
   * Tính toán thống kê cho Partner Dashboard
   */
  static async getStatistics(partnerId: number) {
    // 1. Tính tổng doanh thu và tổng số voucher đã bán thông qua ChiTietDonHang
    const orderStats = await prisma.chiTietDonHang.aggregate({
      _sum: {
        ThanhTien: true,
        SoLuongMua: true,
      },
      where: {
        Voucher: {
          MaDoiTac: partnerId,
        },
      },
    });

    // 2. Đếm số lượng voucher đang chờ duyệt
    const pendingVouchers = await prisma.voucher.count({
      where: {
        MaDoiTac: partnerId,
        TrangThaiVoucher: 'PENDING_APPROVAL',
      },
    });

    // 3. Đếm số lượng voucher đang phát hành (ACTIVE)
    const activeVouchers = await prisma.voucher.count({
      where: {
        MaDoiTac: partnerId,
        TrangThaiVoucher: 'ACTIVE',
      },
    });

    // 4. Lấy danh sách Top Vouchers bán chạy
    const topVouchers = await prisma.voucher.findMany({
      where: { MaDoiTac: partnerId },
      orderBy: { SoLuongDaBan: 'desc' },
      take: 5,
      select: {
        VoucherID: true,
        TenVoucher: true,
        SoLuongDaBan: true,
        GiaBan: true,
      }
    });

    // Xử lý và tính doanh thu ước tính cho Top Vouchers (Dựa trên số lượng đã bán * giá bán)
    const formattedTopVouchers = topVouchers.map((v: any) => ({
      id: v.VoucherID,
      name: v.TenVoucher,
      sold: v.SoLuongDaBan || 0,
      revenue: (v.SoLuongDaBan || 0) * Number(v.GiaBan)
    }));

    // 5. Tính toán dữ liệu biểu đồ 6 tháng gần nhất
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentOrderDetails = await prisma.chiTietDonHang.findMany({
      where: {
        Voucher: {
          MaDoiTac: partnerId,
        },
        DonHang: {
          ThoiGianThanhToan: {
            gte: sixMonthsAgo
          }
        }
      },
      include: {
        DonHang: true
      }
    });

    const salesMap = new Map<string, { revenue: number, vouchers: number }>();
    
    // Khởi tạo 6 tháng
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = `T${d.getMonth() + 1}`;
      salesMap.set(monthStr, { revenue: 0, vouchers: 0 });
    }

    recentOrderDetails.forEach((ct: any) => {
      if (ct.DonHang?.ThoiGianThanhToan) {
        const monthStr = `T${ct.DonHang.ThoiGianThanhToan.getMonth() + 1}`;
        if (salesMap.has(monthStr)) {
          const current = salesMap.get(monthStr)!;
          // Cập nhật giá trị revenue theo triệu VND cho giống mock
          const revenueInMillions = Number(ct.ThanhTien || 0) / 1000000;
          current.revenue = parseFloat((current.revenue + revenueInMillions).toFixed(2));
          current.vouchers += (ct.SoLuongMua || 0);
        }
      }
    });

    const salesData = Array.from(salesMap.entries()).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      vouchers: data.vouchers
    }));

    return {
      totalRevenue: Number(orderStats._sum.ThanhTien) || 0,
      totalSold: Number(orderStats._sum.SoLuongMua) || 0,
      pendingVouchers,
      activeVouchers,
      topVouchers: formattedTopVouchers,
      salesData
    };
  }
}
