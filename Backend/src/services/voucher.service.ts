import prisma from "../config/db";

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

    });
  }


}