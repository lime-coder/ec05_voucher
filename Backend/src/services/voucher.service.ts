import prisma from "../config/db";
import prisma from '../config/db';
import { nanoid } from 'nanoid';

export class VoucherService {

  /**
   * Lấy toàn bộ voucher
   */
  static async getAllVouchers() {
    return await prisma.voucher.findMany({

      include: {
        DanhMuc: true,
        DoiTac: true,
      },

    });
  }


  static async searchVoucher(
    keyword: string,
    minPrice?: number,
    maxPrice?: number,
    category?: string,
    brand?: string,
  ) {

    return await prisma.voucher.findMany({

      where: {

        TrangThaiVoucher:
          "ACTIVE",

        AND: [

          // Search
          {
            OR: [

              {
                TenVoucher: {
                  contains: keyword,
                },
              },

              {
                DoiTac: {
                  is: {
                    TenDoanhNghiep: {
                      contains: keyword,
                    },
                  },
                },
              },

              {
                DanhMuc: {
                  is: {
                    TenDanhMuc: {
                      contains: keyword,
                    },
                  },
                },
              },

            ],
          },

          // Price min
          minPrice
            ? {
                GiaBan: {
                  gte: minPrice,
                },
              }
            : {},

          // Price max
          maxPrice
            ? {
                GiaBan: {
                  lte: maxPrice,
                },
              }
            : {},

          // Category
          category
            ? {
                DanhMuc: {
                  is: {
                    TenDanhMuc: {
                      in: category.split(","),
                    },
                  },
                },
              }
            : {},

          // Brand
          brand
            ? {
                DoiTac: {
                  is: {
                    TenDoanhNghiep: {
                      in: brand.split(","),
                    },
                  },
                },
              }
            : {},
        ],
      },

      include: {

        DanhMuc: true,

        DoiTac: true,

      },
    });
  }



  /**
   * Lấy voucher theo ID
   */

  static async getVoucherById(
    id: string
  ) {

    return await prisma.voucher.findUnique({

      where: {
        VoucherID: Number(id),
      },

      include: {
        DanhMuc: true,
        DoiTac: true,
      },

   * Sinh mã Voucher ngẫu nhiên bằng nanoid (độ dài 10-12 ký tự)
   * Sử dụng để tạo mã 'SoMaVoucher' khi khách hàng mua voucher thành công.
   */
  static generateVoucherCode(length: number = 10): string {
    return nanoid(length).toUpperCase();
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
        ThoiGianKetThuc: data.validEndDate ? new Date(data.validEndDate) : new Date(Date.now() + 30*24*60*60*1000),
        TrangThaiVoucher: data.status || 'DRAFT'
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
        ThoiGianBatDau: data.validStartDate ? new Date(data.validStartDate) : new Date(),
        ThoiGianKetThuc: data.validEndDate ? new Date(data.validEndDate) : new Date(Date.now() + 30*24*60*60*1000),
        TrangThaiVoucher: data.status || 'DRAFT'
      }
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


}