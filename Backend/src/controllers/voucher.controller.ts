import { Request, Response } from 'express';
import { VoucherService } from '../services/voucher.service';
import prisma from '../config/db';
import { logActivity } from './admin.controller';

/**
 * Controller handles the HTTP Request/Response flow.
 * It extracts data from 'req' and calls the appropriate Service function.
 */


export const getAllVouchers = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
    } = req.query;

    const vouchers = await prisma.voucher.findMany({
      where: {
        TrangThaiVoucher: 'ACTIVE',

        ...(search
          ? {
              TenVoucher: {
                contains: String(search),
              },
            }
          : {}),

        ...(category
          ? {
              MaDanhMuc: Number(category),
            }
          : {}),

        ...(minPrice || maxPrice
          ? {
              GiaBan: {
                ...(minPrice
                  ? {
                      gte: Number(minPrice),
                    }
                  : {}),

                ...(maxPrice
                  ? {
                      lte: Number(maxPrice),
                    }
                  : {}),
              },
            }
          : {}),
      },
    });

    const mapped = vouchers.map((v: any) => ({
      id: v.VoucherID,

      name: v.TenVoucher,

      description: v.MoTaVoucher,

      condition: v.MoTaDieuKien,

      originalPrice: v.GiaGoc,

      salePrice: v.GiaBan,

      image: v.HinhAnhVoucher,

      quantity: v.SoLuong,

      status: v.TrangThaiVoucher,

      categoryId: v.MaDanhMuc,

      partnerId: v.MaDoiTac,
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to fetch vouchers',
    });
  }
};


export const getVoucherById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const voucher =
      await prisma.voucher.findFirst({
        where: {
          VoucherID: Number(id),

          TrangThaiVoucher:
            "ACTIVE",
        },

        include: {
          DanhMuc: true,

          DoiTac: true,

          DanhGias: true,

          ChiNhanhs: {
            include: {
              ChiNhanh: true,
            },
          },
        },
      });

    if (!voucher) {
      return res.status(404).json({
        message:
          "Voucher not found",
      });
    }

    // Average rating
    const avgRating =
      voucher.DanhGias.length > 0
        ? voucher.DanhGias.reduce(
            (
              acc: number,
              review: any
            ) =>
              acc +
              Number(
                review.DiemDanhGia ||
                  0
              ),
            0
          ) /
          voucher.DanhGias.length
        : 0;

    const mapped = {
      id: voucher.VoucherID,

      name:
        voucher.TenVoucher,

      description:
        voucher.MoTaVoucher,

      condition:
        voucher.MoTaDieuKien,

      refundPolicy:
        voucher.ChinhSachHoanTien,

      usageGuide:
        voucher.HuongDanSuDung,

      originalPrice:
        Number(voucher.GiaGoc),

      salePrice:
        Number(voucher.GiaBan),

      quantity:
        voucher.SoLuongChoPhep,

      sold:
        voucher.SoLuongDaBan || 0,

      stock:
        voucher.SoLuongChoPhep -
        (voucher.SoLuongDaBan ||
          0),

      status:
        voucher.TrangThaiVoucher,

      startDate:
        voucher.ThoiGianBatDau,

      endDate:
        voucher.ThoiGianKetThuc,

      image:
        voucher.ImageUrl,

      category: voucher.DanhMuc
        ? {
            id:
              voucher.DanhMuc
                .MaDanhMuc,

            name:
              voucher.DanhMuc
                .TenDanhMuc,
          }
        : null,

      partner: voucher.DoiTac
        ? {
            id:
              voucher.DoiTac
                .MaDoiTac,

            name:
              voucher.DoiTac
                .TenDoanhNghiep,

            taxCode:
              voucher.DoiTac
                .MaSoThue,

            avatar:
              voucher.DoiTac
                .AvatarUrl,

            businessField:
              voucher.DoiTac
                .LinhVucKinhDoanh,
          }
        : null,

      rating: Number(
        avgRating.toFixed(1)
      ),

      reviewCount:
        voucher.DanhGias.length,

      reviews:
        voucher.DanhGias.map(
          (review: any) => ({
            id:
              review.MaDanhGia,

            rating:
              review.DiemDanhGia,

            comment:
              review.NoiDung,

            createdAt:
              review.NgayDanhGia,

            reply:
              review.PhanHoiXuLy,
          })
        ),

      branches:
        voucher.ChiNhanhs.map(
          (branch: any) => ({
            id:
              branch.ChiNhanh
                ?.MaChiNhanh,

            name:
              branch.ChiNhanh
                ?.TenChiNhanh,

            phone:
              branch.ChiNhanh
                ?.SDT_CN,

            address:
              branch.ChiNhanh
                ?.DiaChiChiNhanh,
          })
        ),
    };

    res.status(200).json(
      mapped
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch voucher",
    });
  }
};


export const createVoucher = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newVoucher = await VoucherService.createVoucher(data);
    res.status(201).json(newVoucher);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedVoucher = await VoucherService.updateVoucher(parseInt(id, 10), data);
    res.status(200).json(updatedVoucher);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getVouchersByPartnerId = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId, 10);
    const vouchers = await VoucherService.getVouchersByPartnerId(partnerId);
    res.status(200).json(vouchers);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// === Admin functions ===
export const getPendingVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { TrangThaiVoucher: 'PENDING_APPROVAL' },
      include: { DoiTac: true }
    });

    const mapped = vouchers.map((v: any) => {
      const timeStr = v.ThoiGianBatDau
        ? new Date(v.ThoiGianBatDau).toLocaleDateString('vi-VN')
        : '';
      return {
        id: v.VoucherID,
        name: v.TenVoucher,
        partner: v.DoiTac?.TenDoanhNghiep || 'Đối tác ẩn',
        originalPrice: Number(v.GiaGoc).toLocaleString('vi-VN') + 'đ',
        salePrice: Number(v.GiaBan).toLocaleString('vi-VN') + 'đ',
        quantity: v.SoLuongChoPhep,
        date: timeStr,
        status: 'Chờ duyệt'
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const approveVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.update({
      where: { VoucherID: Number(id) },
      data: { TrangThaiVoucher: 'ACTIVE' }
    });
    logActivity('admin@voucher.vn', 'Phê duyệt voucher', voucher.TenVoucher, req.ip || '127.0.0.1');
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const rejectVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lyDo } = req.body;

    const voucher = await prisma.voucher.update({
      where: { VoucherID: Number(id) },
      data: { TrangThaiVoucher: 'REJECTED' }
    });

    logActivity('admin@voucher.vn', 'Từ chối voucher', `${voucher.TenVoucher} (Lý do: ${lyDo})`, req.ip || '127.0.0.1');
    console.log(`Từ chối voucher ${id} với lý do: ${lyDo}`);
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const categories =
      await prisma.danhMuc.findMany({
        include: {
          _count: {
            select: {
              Vouchers: {
                where: {
                  TrangThaiVoucher:
                    "ACTIVE",
                },
              },
            },
          },
        },

        orderBy: {
          MaDanhMuc: "asc",
        },
      });

    const mapped =
      categories.map(((c: any) => ({
        id: c.MaDanhMuc,

        name: c.TenDanhMuc,

        totalVouchers:
          c._count.Vouchers,
      })));

    res.json(mapped);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch categories",
    });
  }
};