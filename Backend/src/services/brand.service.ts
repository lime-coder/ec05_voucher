import prisma from '../config/db';
import { VOUCHER_STATUS, PAYMENT_STATUS } from '../constants';

export class BrandService {
  /**
   * Fetch public details of a brand (partner)
   */
  static async getBrandDetails(partnerId: number) {
    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: partnerId },
      include: {
        ChiNhanh: true,
        Vouchers: {
          where: { TrangThaiVoucher: VOUCHER_STATUS.ACTIVE }
        }
      }
    });

    if (!partner) return null;

    // Calculate rating and sales
    const vouchers = partner.Vouchers || [];
    const voucherIds = vouchers.map((v: any) => v.VoucherID);

    let averageRating = 0;
    let totalReviews = 0;
    let totalSales = 0;

    if (voucherIds.length > 0) {
      const reviews = await prisma.danhGia.findMany({
        where: { VoucherID: { in: voucherIds } },
        include: {
          TaiKhoan: true
        },
        orderBy: { NgayDanhGia: 'desc' }
      });

      totalReviews = reviews.length;
      if (totalReviews > 0) {
        averageRating = reviews.reduce((sum, r) => sum + (r.DiemDanhGia || 0), 0) / totalReviews;
      }

      // Format reviews
      const formattedReviews = reviews.map(r => ({
        id: r.MaDanhGia,
        user: r.TaiKhoan?.HoTenNguoiDung || 'Khách hàng',
        date: r.NgayDanhGia ? new Date(r.NgayDanhGia).toLocaleDateString('vi-VN') : '',
        rating: r.DiemDanhGia || 5,
        comment: r.NoiDung || '',
        reply: r.PhanHoiXuLy ? { user: 'Store', date: '', comment: r.PhanHoiXuLy } : null
      }));

      // Calculate total sales
      const orderStats = await prisma.chiTietDonHang.aggregate({
        _sum: {
          SoLuongMua: true
        },
        where: {
          VoucherID: { in: voucherIds },
          DonHang: { TrangThaiThanhToan: PAYMENT_STATUS.PAID }
        }
      });
      totalSales = Number(orderStats._sum.SoLuongMua || 0);

      // Format vouchers for frontend
      const formattedVouchers = vouchers.map((v: any) => ({
        id: v.VoucherID.toString(),
        image: v.ImageUrl ? `http://localhost:5000${v.ImageUrl}` : '',
        name: v.TenVoucher,
        partner: partner.TenDoanhNghiep,
        price: Number(v.GiaBan || 0),
        originalPrice: Number(v.GiaGoc || 0),
        discount: v.GiaGoc && v.GiaBan ? Math.round(((Number(v.GiaGoc) - Number(v.GiaBan)) / Number(v.GiaGoc)) * 100) : 0,
        rating: averageRating,
        reviews: totalReviews
      }));

      // Format branches
      const formattedBranches = partner.ChiNhanh?.map((b: any) => ({
        name: b.TenChiNhanh,
        address: b.DiaChiChiNhanh
      })) || [];

      // Ensure time formatting if available
      const formatTime = (timeValue: any) => {
        if (!timeValue) return null;
        if (timeValue instanceof Date) {
          // SQL Server TIME comes as a Date object restricted to 1970-01-01
          return timeValue.toISOString().substring(11, 16);
        }
        return timeValue.toString().substring(0, 5);
      };

      return {
        store: {
          id: partner.MaDoiTac,
          name: partner.TenDoanhNghiep,
          avatar: partner.AvatarUrl ? `http://localhost:5000${partner.AvatarUrl}` : '',
          about: partner.MoTa || partner.LinhVucKinhDoanh || '',
          joinedDate: partner.NgayThamGia ? new Date(partner.NgayThamGia).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '',
          totalSales,
          rating: averageRating,
          email: partner.EmailLienHe,
          phone: partner.SDTLienHe,
          openTime: formatTime(partner.GioMoCua),
          closeTime: formatTime(partner.GioDongCua)
        },
        branches: formattedBranches,
        vouchers: formattedVouchers,
        reviews: formattedReviews
      };
    } else {
      // If no vouchers, just return empty arrays
      return {
        store: {
          id: partner.MaDoiTac,
          name: partner.TenDoanhNghiep,
          avatar: partner.AvatarUrl ? `http://localhost:5000${partner.AvatarUrl}` : '',
          about: partner.MoTa || partner.LinhVucKinhDoanh || '',
          joinedDate: partner.NgayThamGia ? new Date(partner.NgayThamGia).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : '',
          totalSales: 0,
          rating: 0,
          email: partner.EmailLienHe,
          phone: partner.SDTLienHe,
          openTime: partner.GioMoCua ? partner.GioMoCua.toString().substring(0, 5) : '',
          closeTime: partner.GioDongCua ? partner.GioDongCua.toString().substring(0, 5) : ''
        },
        branches: partner.ChiNhanh?.map((b: any) => ({ name: b.TenChiNhanh, address: b.DiaChiChiNhanh })) || [],
        vouchers: [],
        reviews: []
      };
    }
  }
}
