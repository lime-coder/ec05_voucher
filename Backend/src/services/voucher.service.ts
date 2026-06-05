import prisma from '../config/db';
import { customAlphabet } from 'nanoid';

// Bộ ký tự an toàn (bỏ 0, O, 1, I, L)
const SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const nanoidSafe = customAlphabet(SAFE_ALPHABET, 10);

export class VoucherService {
  /**
   * Sinh mã Voucher ngẫu nhiên bằng nanoid (độ dài 10-12 ký tự)
   * Sử dụng để tạo mã 'SoMaVoucher' khi khách hàng mua voucher thành công.
   */
  static generateVoucherCode(): string {
    const length = Math.floor(Math.random() * 3) + 10; // random 10, 11, or 12
    return customAlphabet(SAFE_ALPHABET, length)();
  }

  /**
   * Retrieves all vouchers from the database using Prisma.
   */
  static async getAllVouchers() {
    return await prisma.voucher.findMany();
  }

  static async getVoucherById(id: number) {
    return await prisma.voucher.findUnique({ where: { VoucherID: id } });
  }

  /**
   * Tạo Voucher mới (Form).
   * Dữ liệu gửi lên sẽ kèm TrangThaiVoucher là 'DRAFT' hoặc 'PENDING_APPROVAL'
   */
  static async createVoucher(data: any) {
    return await prisma.voucher.create({
      data: {
        TenVoucher: data.name,
        MaDanhMuc: data.categoryId || null, // Có thể chỉnh sửa logic mapping nếu data có mảng categories
        MaDoiTac: data.partnerId || 1, // Giả sử lấy MaDoiTac từ context người dùng hiện tại
        MoTaVoucher: data.description,
        MoTaDieuKien: data.terms,
        GiaGoc: data.originalPrice ? parseFloat(data.originalPrice) : 100,
        GiaBan: data.salePrice ? parseFloat(data.salePrice) : 0,
        SoLuongChoPhep: parseInt(data.quantity) || 0,
        ThoiGianBatDau: data.validStartDate ? new Date(data.validStartDate) : new Date(),
        ThoiGianKetThuc: data.validEndDate ? new Date(data.validEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        TrangThaiVoucher: data.status || 'DRAFT',
        ChinhSachHoanTien: data.refundPolicy || null,
        HuongDanSuDung: data.usageInstructions || null,
        ...(data.imageUrl && { ImageUrl: data.imageUrl } as any)
      }
    });
  }

  /**
   * Cập nhật Voucher đã có.
   */
  static async updateVoucher(id: number, data: any) {
    return await prisma.voucher.update({
      where: { VoucherID: id },
      data: {
        TenVoucher: data.name,
        MaDanhMuc: data.categoryId || null,
        MoTaVoucher: data.description,
        MoTaDieuKien: data.terms,
        GiaGoc: data.originalPrice ? parseFloat(data.originalPrice) : 100,
        GiaBan: data.salePrice ? parseFloat(data.salePrice) : 0,
        SoLuongChoPhep: parseInt(data.quantity) || 0,
        ThoiGianBatDau: data.validStartDate ? new Date(data.validStartDate) : undefined,
        ThoiGianKetThuc: data.validEndDate ? new Date(data.validEndDate) : undefined,
        TrangThaiVoucher: data.status,
        ChinhSachHoanTien: data.refundPolicy !== undefined ? data.refundPolicy : undefined,
        HuongDanSuDung: data.usageInstructions !== undefined ? data.usageInstructions : undefined,
        ...(data.imageUrl && { ImageUrl: data.imageUrl } as any)
      }
    });
  }

  /**
   * Xóa mềm Voucher (Chuyển trạng thái thành DELETED)
   */
  static async softDeleteVoucher(id: number) {
    return await prisma.voucher.update({
      where: { VoucherID: id },
      data: { TrangThaiVoucher: 'DELETED' }
    });
  }

  /**
   * Khôi phục Voucher đã xóa mềm
   */
  static async restoreVoucher(id: number) {
    return await prisma.voucher.update({
      where: { VoucherID: id },
      data: { TrangThaiVoucher: 'DRAFT' }
    });
  }

  /**
   * Lấy danh sách Voucher của một đối tác.
   */
  static async getVouchersByPartnerId(partnerId: number) {
    return await prisma.voucher.findMany({
      where: { MaDoiTac: partnerId },
      include: { DanhMuc: true },
      orderBy: { ThoiGianBatDau: 'desc' }
    });
  }

  /**
   * Xác minh mã voucher
   */
  static async verifyVoucherCode(code: string, partnerId: number) {
    const maVoucher = await prisma.maVoucher.findUnique({
      where: { SoMaVoucher: code },
      include: {
        ChiTietDonHang: {
          include: {
            Voucher: true,
            DonHang: {
              include: {
                TaiKhoan: {
                  include: {
                    KhachHang: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!maVoucher || !maVoucher.ChiTietDonHang || !maVoucher.ChiTietDonHang.Voucher) {
      return null;
    }

    const voucher = maVoucher.ChiTietDonHang.Voucher;

    // Check if the voucher belongs to this partner
    if (voucher.MaDoiTac !== partnerId) {
      return null;
    }

    const customerAccount = maVoucher.ChiTietDonHang.DonHang?.TaiKhoan;
    const customerName = customerAccount?.HoTenNguoiDung || 'Khách hàng ẩn danh';
    const customerPhone = customerAccount?.KhachHang?.SDT_KH || 'Chưa cập nhật';

    // Determine status
    let status = 'valid';
    if (maVoucher.TrangThaiSuDung === 'Đã sử dụng') {
      status = 'used';
    } else if (voucher.ThoiGianKetThuc < new Date() || maVoucher.TrangThaiSuDung === 'Hết hạn') {
      status = 'expired';
    }

    // Return mapped object
    return {
      code: maVoucher.SoMaVoucher,
      voucherName: voucher.TenVoucher,
      customerName: customerName,
      customerPhone: customerPhone,
      originalPrice: Number(voucher.GiaGoc),
      salePrice: Number(voucher.GiaBan),
      purchaseDate: maVoucher.ThoiDiemPhatHanh?.toISOString() || maVoucher.ChiTietDonHang.DonHang?.ThoiGianThanhToan?.toISOString() || new Date().toISOString(),
      validUntil: voucher.ThoiGianKetThuc.toISOString(),
      status: status,
      usedDate: maVoucher.ThoiDiemSuDung?.toISOString(),
      branch: 'Tất cả chi nhánh' // Optional: Retrieve from Voucher_ChiNhanh if needed
    };
  }

  /**
   * Xác nhận khách hàng đã sử dụng voucher
   */
  static async confirmVoucherUsage(code: string, partnerId: number) {
    // First verify it's valid and belongs to partner
    const result = await this.verifyVoucherCode(code, partnerId);

    if (!result) {
      throw new Error('Voucher không tồn tại hoặc không thuộc đối tác này');
    }

    if (result.status === 'used') {
      throw new Error('Voucher đã được sử dụng trước đó');
    }

    if (result.status === 'expired') {
      throw new Error('Voucher đã hết hạn sử dụng');
    }

    // Update status in db
    await prisma.maVoucher.update({
      where: { SoMaVoucher: code },
      data: {
        TrangThaiSuDung: 'Đã sử dụng',
        ThoiDiemSuDung: new Date()
      }
    });

    return { success: true, message: 'Đã xác nhận sử dụng voucher thành công' };
  }

  /**
   * Lấy lịch sử xác thực voucher của đối tác
   */
  static async getVerificationHistory(partnerId: number) {
    const usedVouchers = await prisma.maVoucher.findMany({
      where: {
        TrangThaiSuDung: 'Đã sử dụng',
        ChiTietDonHang: {
          Voucher: {
            MaDoiTac: partnerId
          }
        }
      },
      orderBy: {
        ThoiDiemSuDung: 'desc'
      },
      take: 20, // Limit to recent 20 for history
      include: {
        ChiTietDonHang: {
          include: {
            Voucher: true
          }
        }
      }
    });

    return usedVouchers.map(mv => ({
      code: mv.SoMaVoucher,
      voucherName: mv.ChiTietDonHang?.Voucher?.TenVoucher || 'Không xác định',
      time: mv.ThoiDiemSuDung?.toISOString(),
      status: 'verified', // If it's in this list, it was successfully verified and used
      branch: 'Tất cả chi nhánh'
    }));
  }
}
