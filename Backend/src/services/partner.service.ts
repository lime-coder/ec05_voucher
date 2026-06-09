import prisma from '../config/db';
import bcrypt from 'bcrypt';
import { getTarget, setTarget } from '../config/revenueTargetStore';

export class PartnerService {
  /**
   * Lấy thông tin hồ sơ Đối tác
   */
  static async getProfile(partnerId: number) {
    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: partnerId },
      include: {
        NhanViens: {
          include: { TaiKhoan: true }
        }
      }
    });
    if (!partner) return null;

    const email = partner.NhanViens?.[0]?.TaiKhoan?.Email || '';

    return {
      businessName: partner.TenDoanhNghiep || '',
      businessType: partner.LinhVucKinhDoanh || '',
      taxCode: partner.MaSoThue || '',
      representativeName: partner.CaNhanDaiDien || '',
      ...(email && { email }),
      website: '',
      address: '',
      phone: '',
      representativePhone: '',
      representativeEmail: '',
      avatarUrl: (partner as any).AvatarUrl ? `http://localhost:5000${(partner as any).AvatarUrl}` : ''
    };
  }

  /**
   * Cập nhật thông tin hồ sơ Đối tác
   */
  static async updateProfile(partnerId: number, data: any) {
    // Cập nhật thông tin Đối tác chính
    return await prisma.doiTac.update({
      where: { MaDoiTac: partnerId },
      data: {
        TenDoanhNghiep: data.businessName,
        LinhVucKinhDoanh: data.businessType,
        MaSoThue: data.taxCode,
        CaNhanDaiDien: data.representativeName
      }
    });
  }

  /**
   * Cập nhật Avatar
   */
  static async updateAvatar(partnerId: number, relativeUrl: string) {
    return await prisma.doiTac.update({
      where: { MaDoiTac: partnerId },
      data: { AvatarUrl: relativeUrl } as any
    });
  }

  /**
   * Đổi mật khẩu
   */
  static async changePassword(partnerId: number, current: string, newPass: string) {
    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: partnerId },
      include: {
        NhanViens: {
          include: { TaiKhoan: true }
        }
      }
    });

    if (!partner || !partner.NhanViens || partner.NhanViens.length === 0) {
      throw new Error("Không tìm thấy tài khoản để cập nhật mật khẩu.");
    }

    const taiKhoan = partner.NhanViens[0].TaiKhoan;
    if (!taiKhoan) throw new Error("Tài khoản chưa được khởi tạo.");

    const isMatch = await bcrypt.compare(current, taiKhoan.MatKhau);
    if (!isMatch) {
      throw new Error("error.old_password_incorrect");
    }

    if (newPass.length < 8) {
      throw new Error("error.pwd_length");
    }
    if (!/[A-Z]/.test(newPass)) {
      throw new Error("error.pwd_upper");
    }
    if (!/[a-z]/.test(newPass)) {
      throw new Error("error.pwd_lower");
    }
    if (!/[0-9]/.test(newPass)) {
      throw new Error("error.pwd_digit");
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.taiKhoan.update({
      where: { IDTaiKhoan: taiKhoan.IDTaiKhoan },
      data: { MatKhau: hashedPassword }
    });

    return true;
  }

  /**
   * Tính toán thống kê cho Partner Dashboard
   */
  static async getStatistics(partnerId: number) {
    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: partnerId },
      select: { TenDoanhNghiep: true }
    });
    const partnerName = partner?.TenDoanhNghiep || 'Đối Tác';

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
        DonHang: {
          TrangThaiThanhToan: 'Đã thanh toán',
        },
      },
    });

    // 2. Đếm số lượng voucher đang chờ duyệt
    const pendingVouchers = await prisma.voucher.count({
      where: {
        MaDoiTac: partnerId,
        TrangThaiVoucher: 'Chờ duyệt',
      },
    });

    // 3. Đếm số lượng voucher đang phát hành (ACTIVE)
    const activeVouchers = await prisma.voucher.count({
      where: {
        MaDoiTac: partnerId,
        TrangThaiVoucher: 'Đang hoạt động',
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
          },
          TrangThaiThanhToan: 'Đã thanh toán',
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
      salesData,
      partnerName
    };
  }

  static async getReports(partnerId: number, timeRange: string) {
    const now = new Date();

    // Tính offset ngày theo kỳ, tất cả từ `now` để tránh bug setDate lồng nhau
    const DAYS: Record<string, number> = {
      week: 7, month: 30, quarter: 90, year: 365
    };
    const days = DAYS[timeRange] ?? 30;

    const currentStartDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    const getRangeStats = async (start: Date, end: Date) => {
      // Dùng quan hệ trực tiếp để query an toàn nhất trên SQL Server
      const items = await prisma.chiTietDonHang.findMany({
        where: {
          Voucher: { MaDoiTac: partnerId },
          DonHang: {
            ThoiGianThanhToan: { gte: start, lte: end },
            TrangThaiThanhToan: 'Đã thanh toán'
          }
        },
        include: { DonHang: true }
      });

      const revenue = items.reduce((sum: number, o: any) => sum + Number(o.ThanhTien || 0), 0);
      const sold = items.reduce((sum: number, o: any) => sum + Number(o.SoLuongMua || 0), 0);

      // Khách hàng mới: lần đầu mua từ partner này (chưa có đơn nào trước kỳ bắt đầu)
      const customerIdsInPeriod = [...new Set(
        items.map((o: any) => o.DonHang?.IDTaiKhoan).filter(Boolean)
      )] as number[];

      const newCustomerChecks = await Promise.all(
        customerIdsInPeriod.map(async (customerId) => {
          // Tìm đơn hàng cũ hơn của cùng KH này từ partner
          const hasOldPartnerOrder = await prisma.chiTietDonHang.findFirst({
            where: {
              Voucher: { MaDoiTac: partnerId },
              DonHang: {
                IDTaiKhoan: customerId,
                ThoiGianThanhToan: { lt: start },
                TrangThaiThanhToan: 'Đã thanh toán',
              }
            }
          });
          return hasOldPartnerOrder === null;
        })
      );
      const newCustomers = newCustomerChecks.filter(Boolean).length;

      const reviews = await prisma.danhGia.findMany({
        where: { Voucher: { MaDoiTac: partnerId }, NgayDanhGia: { gte: start, lte: end } }
      });
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + Number(r.DiemDanhGia || 0), 0) / reviews.length
        : 0;

      return { revenue, sold, customers: newCustomers, avgRating, orders: items };
    };


    const currentStats = await getRangeStats(currentStartDate, now);
    const prevStats = await getRangeStats(previousStartDate, currentStartDate);


    const calculateTrend = (current: number, prev: number) => {
      if (prev === 0) return { trend: current > 0 ? 'up' : 'neutral', change: current > 0 ? '100%' : '0%' };
      const diff = current - prev;
      const percentage = Math.abs((diff / prev) * 100).toFixed(1);
      return {
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
        change: `${percentage}%`
      };
    };

    const formatCurrency = (val: number) => {
      // Trên 1 triệu: hiển thị cụ thể có dấu phân cách (ví dụ: 1.600.000₫)
      if (val >= 1000000) return `${val.toLocaleString('vi-VN')}₫`;
      // Từ 1.000 đến dưới 1 triệu: dạng K (ví dụ: 800K)
      if (val >= 1000) return `${(val / 1000).toFixed(0)}K₫`;
      return `${val.toLocaleString('vi-VN')}₫`;
    };

    const reportStats = [
      {
        id: 'revenue',
        value: formatCurrency(currentStats.revenue),
        ...calculateTrend(currentStats.revenue, prevStats.revenue),
        icon: 'money',
        background: '#e3f2fd'
      },
      {
        id: 'sold',
        value: currentStats.sold.toString(),
        ...calculateTrend(currentStats.sold, prevStats.sold),
        icon: 'voucher',
        background: '#f3e5f5'
      },
      {
        id: 'customers',
        value: currentStats.customers.toString(),
        ...calculateTrend(currentStats.customers, prevStats.customers),
        icon: 'people',
        background: '#e8f5e9'
      },
      {
        id: 'rating',
        value: currentStats.avgRating.toFixed(1),
        ...calculateTrend(currentStats.avgRating, prevStats.avgRating),
        icon: 'star',
        background: '#fff3e0'
      }
    ];

    // Đọc mục tiêu do partner tự đặt (lưu trong file JSON trên server)
    const savedTarget = getTarget(partnerId, timeRange);

    const DAYS_BY_RANGE: Record<string, number> = {
      week: 7, month: 30, quarter: 90, year: 365
    };
    const periodDays = DAYS_BY_RANGE[timeRange] ?? 30;

    let targetGoal: number;

    if (savedTarget !== null && savedTarget > 0) {
      // Partner đã tự đặt mục tiêu → dùng ngay
      targetGoal = savedTarget;
    } else if (prevStats.revenue > 0) {
      // Fallback 1: doanh thu kỳ trước
      targetGoal = prevStats.revenue;
    } else {
      // Fallback 2: TB ngày 12 tháng qua × số ngày kỳ hiện tại
      const yearAgo = new Date();
      yearAgo.setDate(yearAgo.getDate() - 365);
      const yearStats = await prisma.chiTietDonHang.aggregate({
        _sum: { ThanhTien: true },
        where: {
          Voucher: { MaDoiTac: partnerId },
          DonHang: {
            ThoiGianThanhToan: { gte: yearAgo },
            TrangThaiThanhToan: 'Đã thanh toán'
          }
        }
      });
      const yearRevenue = Number(yearStats._sum.ThanhTien || 0);
      targetGoal = yearRevenue > 0
        ? Math.round((yearRevenue / 365) * periodDays)
        : Math.round((10_000_000 / 30) * periodDays);
    }

    const revenueData = [];
    if (timeRange === 'week' || timeRange === 'month') {
      const days = timeRange === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = `${d.getDate()}/${d.getMonth() + 1}`;
        const dayOrders = currentStats.orders.filter((o: any) => {
          if (!o.DonHang?.ThoiGianThanhToan) return false;
          const od = new Date(o.DonHang.ThoiGianThanhToan);
          return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
        });
        const rev = dayOrders.reduce((sum: number, o: any) => sum + Number(o.ThanhTien || 0), 0);
        revenueData.push({
          month: dayStr,
          revenue: Number((rev / 1000000).toFixed(2)),
          target: Number((targetGoal / days / 1000000).toFixed(2))
        });
      }
    } else {
      const months = timeRange === 'quarter' ? 3 : 12;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = `T${d.getMonth() + 1}`;
        const monthOrders = currentStats.orders.filter((o: any) => {
          if (!o.DonHang?.ThoiGianThanhToan) return false;
          const od = new Date(o.DonHang.ThoiGianThanhToan);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
        });
        const rev = monthOrders.reduce((sum: number, o: any) => sum + Number(o.ThanhTien || 0), 0);
        revenueData.push({
          month: monthStr,
          revenue: Number((rev / 1000000).toFixed(2)),
          target: Number((targetGoal / months / 1000000).toFixed(2))
        });
      }
    }

    const customerMap = new Map<number, { spent: number, purchases: number }>();
    currentStats.orders.forEach((o: any) => {
      const accId = o.DonHang?.IDTaiKhoan;
      if (accId) {
        if (!customerMap.has(accId)) {
          customerMap.set(accId, { spent: 0, purchases: 0 });
        }
        const cust = customerMap.get(accId)!;
        cust.spent += Number(o.ThanhTien || 0);
        cust.purchases += Number(o.SoLuongMua || 0);
      }
    });

    const sortedCustomers = Array.from(customerMap.entries())
      .sort((a, b) => b[1].spent - a[1].spent)
      .slice(0, 5);

    const topCustomers = await Promise.all(sortedCustomers.map(async ([accId, data]) => {
      const acc = await prisma.taiKhoan.findUnique({
        where: { IDTaiKhoan: accId },
        select: { HoTenNguoiDung: true }
      });
      return {
        name: acc?.HoTenNguoiDung || `Khách hàng #${accId}`,
        purchases: data.purchases,
        spent: data.spent
      };
    }));

    // Doanh thu thực của toàn bộ kỳ đang xem
    const currentRevenue = currentStats.revenue;
    const completionRate = Math.min(Math.round((currentRevenue / targetGoal) * 100), 999);

    const targetStats = {
      completionRate,
      currentRevenue,
      targetGoal,
      isCustomTarget: savedTarget !== null && savedTarget > 0
    };

    return {
      reportStats,
      revenueData,
      targetStats,
      topCustomers
    };
  }

  /**
   * Partner tự đặt mục tiêu doanh thu cho từng kỳ (lưu file JSON)
   */
  static updateRevenueTarget(partnerId: number, timeRange: string, target: number) {
    const validRanges = ['week', 'month', 'quarter', 'year'];
    if (!validRanges.includes(timeRange)) throw new Error('timeRange không hợp lệ');
    if (target < 0) throw new Error('Mục tiêu phải >= 0');
    setTarget(partnerId, timeRange, target);
    return { success: true, timeRange, target };
  }
}
