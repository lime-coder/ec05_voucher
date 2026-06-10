import prisma from '../config/db';
import { customAlphabet } from 'nanoid';
import { commitVoucherImage } from '../utils/media.util';
import { mapApiStatusToDb } from '../utils/statusMapper';
import { VOUCHER_STATUS, VOUCHER_USAGE_STATUS } from '../constants';

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
    let statusDb = data.status ? mapApiStatusToDb(data.status) : VOUCHER_STATUS.DRAFT;

    const partnerId = data.partnerId || 1;
    const partner = await prisma.doiTac.findUnique({ where: { MaDoiTac: partnerId } });
    const partnerName = partner ? partner.TenDoanhNghiep : 'Unknown';

    let imageUrl = data.imageUrl !== undefined ? data.imageUrl : null;

    const voucher = await prisma.voucher.create({
      data: {
        TenVoucher: data.name,
        MaDanhMuc: data.categoryId || null, // Có thể chỉnh sửa logic mapping nếu data có mảng categories
        MaDoiTac: partnerId, // Giả sử lấy MaDoiTac từ context người dùng hiện tại
        MoTaVoucher: data.description,
        MoTaDieuKien: data.terms,
        GiaGoc: data.originalPrice ? parseFloat(data.originalPrice) : 100,
        GiaBan: data.salePrice ? parseFloat(data.salePrice) : 0,
        SoLuongChoPhep: parseInt(data.quantity) || 0,
        ThoiGianBatDau: data.validStartDate ? new Date(data.validStartDate) : new Date(),
        ThoiGianKetThuc: data.validEndDate ? new Date(data.validEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ThoiGianBatDauBan: data.saleStartDate ? new Date(data.saleStartDate) : null,
        ThoiGianKetThucBan: data.saleEndDate ? new Date(data.saleEndDate) : null,
        TrangThaiVoucher: statusDb,
        ChinhSachHoanTien: data.refundPolicy || null,
        HuongDanSuDung: data.usageInstructions || null,
        ImageUrl: imageUrl
      }
    });

    if (imageUrl && imageUrl.includes('/uploads/temp/')) {
      const finalImageUrl = commitVoucherImage(imageUrl, voucher.VoucherID, partnerId, partnerName || 'Unknown', voucher.TenVoucher);
      if (finalImageUrl && finalImageUrl !== imageUrl) {
        await prisma.voucher.update({
          where: { VoucherID: voucher.VoucherID },
          data: { ImageUrl: finalImageUrl }
        });
        voucher.ImageUrl = finalImageUrl;
      }
    }

    return voucher;
  }

  /**
   * Cập nhật Voucher đã có.
   */
  static async updateVoucher(id: number, data: any) {
    let statusDb = data.status;
    if (data.status) {
      statusDb = mapApiStatusToDb(data.status);
    }

    const oldVoucher = await prisma.voucher.findUnique({
      where: { VoucherID: id },
      include: { DoiTac: true }
    });

    if (oldVoucher?.TrangThaiVoucher === VOUCHER_STATUS.REJECTED && statusDb === VOUCHER_STATUS.ACTIVE) {
      throw new Error('Không thể tự kích hoạt lại voucher đã bị từ chối/khóa bởi hệ thống.');
    }

    let finalImageUrl = data.imageUrl;
    if (finalImageUrl !== undefined && finalImageUrl !== oldVoucher?.ImageUrl) {
      const partnerName = oldVoucher?.DoiTac?.TenDoanhNghiep || 'Unknown';
      const partnerId = oldVoucher?.MaDoiTac || 1;
      const voucherName = data.name || oldVoucher?.TenVoucher || 'Unknown';

      finalImageUrl = commitVoucherImage(
        finalImageUrl || '',
        id,
        partnerId,
        partnerName,
        voucherName,
        oldVoucher?.ImageUrl || undefined
      );
    }

    const dataToUpdate: any = {};
    if (data.name !== undefined) dataToUpdate.TenVoucher = data.name;
    if (data.categoryId !== undefined) dataToUpdate.MaDanhMuc = data.categoryId;
    if (data.description !== undefined) dataToUpdate.MoTaVoucher = data.description;
    if (data.terms !== undefined) dataToUpdate.MoTaDieuKien = data.terms;
    if (data.originalPrice !== undefined) dataToUpdate.GiaGoc = parseFloat(data.originalPrice);
    if (data.salePrice !== undefined) dataToUpdate.GiaBan = parseFloat(data.salePrice);
    if (data.quantity !== undefined) dataToUpdate.SoLuongChoPhep = parseInt(data.quantity);
    if (data.validStartDate !== undefined) dataToUpdate.ThoiGianBatDau = new Date(data.validStartDate);
    if (data.validEndDate !== undefined) dataToUpdate.ThoiGianKetThuc = new Date(data.validEndDate);
    if (data.saleStartDate !== undefined) dataToUpdate.ThoiGianBatDauBan = new Date(data.saleStartDate);
    if (data.saleEndDate !== undefined) dataToUpdate.ThoiGianKetThucBan = new Date(data.saleEndDate);
    if (statusDb !== undefined) dataToUpdate.TrangThaiVoucher = statusDb;
    if (data.refundPolicy !== undefined) dataToUpdate.ChinhSachHoanTien = data.refundPolicy;
    if (data.usageInstructions !== undefined) dataToUpdate.HuongDanSuDung = data.usageInstructions;
    if (finalImageUrl !== undefined) dataToUpdate.ImageUrl = finalImageUrl;

    return await prisma.voucher.update({
      where: { VoucherID: id },
      data: dataToUpdate
    });
  }

  /**
   * Xóa mềm Voucher (Chuyển trạng thái thành DELETED)
   */
  static async softDeleteVoucher(id: number) {
    const voucher = await prisma.voucher.findUnique({ where: { VoucherID: id } });
    if (voucher?.ImageUrl) {
      const { deleteMediaFile } = require('../utils/media.util');
      deleteMediaFile(voucher.ImageUrl);
    }

    return await prisma.voucher.update({
      where: { VoucherID: id },
      data: { TrangThaiVoucher: VOUCHER_STATUS.DELETED, ImageUrl: null }
    });
  }

  /**
   * Khôi phục Voucher đã xóa mềm
   */
  static async restoreVoucher(id: number) {
    return await prisma.voucher.update({
      where: { VoucherID: id },
      data: { TrangThaiVoucher: VOUCHER_STATUS.DRAFT }
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
    const maVoucher: any = await prisma.maVoucher.findUnique({
      where: { SoMaVoucher: code },
      include: {
        ChiNhanh: true,
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
      } as any
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
    if (maVoucher.TrangThaiSuDung === 'Hủy voucher') {
      status = 'refunded';
    } else if (maVoucher.TrangThaiSuDung === VOUCHER_USAGE_STATUS.USED) {
      status = 'used';
    } else if (voucher.ThoiGianKetThuc < new Date() || maVoucher.TrangThaiSuDung === VOUCHER_USAGE_STATUS.EXPIRED) {
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
      branch: (maVoucher as any).ChiNhanh?.TenChiNhanh || 'Tất cả chi nhánh'
    };
  }

  /**
   * Xác nhận khách hàng đã sử dụng voucher
   */
  static async confirmVoucherUsage(code: string, partnerId: number, branchId?: number) {
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

    if (result.status === 'refunded') {
      throw new Error('Voucher đã bị hủy hoặc hoàn tiền');
    }

    // Update status in db
    await prisma.maVoucher.update({
      where: { SoMaVoucher: code },
      data: {
        TrangThaiSuDung: VOUCHER_USAGE_STATUS.USED,
        ThoiDiemSuDung: new Date(),
        // @ts-ignore
        MaChiNhanhSuDung: branchId || null
      }
    });

    return { success: true, message: 'Đã xác nhận sử dụng voucher thành công' };
  }

  /**
   * Lấy lịch sử xác thực voucher của đối tác
   */
  static async getVerificationHistory(partnerId: number) {
    const usedVouchers: any[] = await prisma.maVoucher.findMany({
      where: {
        TrangThaiSuDung: VOUCHER_USAGE_STATUS.USED,
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
        ChiNhanh: true,
        ChiTietDonHang: {
          include: {
            Voucher: true
          }
        }
      } as any
    });

    return usedVouchers.map(mv => ({
      code: mv.SoMaVoucher,
      voucherName: mv.ChiTietDonHang?.Voucher?.TenVoucher || 'Không xác định',
      time: mv.ThoiDiemSuDung?.toISOString(),
      status: 'verified', // If it's in this list, it was successfully verified and used
      branch: (mv as any).ChiNhanh?.TenChiNhanh || 'Tất cả chi nhánh'
    }));
  }
}
