import { Request, Response } from 'express';
import { VoucherService } from '../services/voucher.service';
import prisma from '../config/db';
import { logActivity } from './admin.controller';
import fs from 'fs';
import path from 'path';

/**
 * Controller handles the HTTP Request/Response flow.
 * It extracts data from 'req' and calls the appropriate Service function.
 */

export const getAllVouchers =
  async (
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

      const vouchers =
        await prisma.voucher.findMany(
          {
            where: {
              TrangThaiVoucher: 'Đang hoạt động',

              ...(search
                ? {
                    TenVoucher:
                      {
                        contains:
                          String(
                            search
                          ),
                      },
                  }
                : {}),

              ...(category
                ? {
                    MaDanhMuc:
                      Number(
                        category
                      ),
                  }
                : {}),

              ...(minPrice ||
              maxPrice
                ? {
                    GiaBan: {
                      ...(minPrice
                        ? {
                            gte: Number(
                              minPrice
                            ),
                          }
                        : {}),

                      ...(maxPrice
                        ? {
                            lte: Number(
                              maxPrice
                            ),
                          }
                        : {}),
                    },
                  }
                : {}),
            },

            include: {
              DanhMuc: true,
              DoiTac: true,
              DanhGias: true,
            },
          }
        );

      const mapped =
        vouchers.map(
          (v: any) => ({
            id:
              v.VoucherID,

            name:
              v.TenVoucher,

            description:
              v.MoTaVoucher,

            condition:
              v.MoTaDieuKien,

            originalPrice:
              Number(
                v.GiaGoc
              ),

            salePrice:
              Number(
                v.GiaBan
              ),

            image:
              v.ImageUrl ||
              v.HinhAnhVoucher,

            quantity:
              v.SoLuong,

            status:
              v.TrangThaiVoucher,

            rating:
              v.DanhGias && v.DanhGias.length > 0
                ? v.DanhGias.reduce((sum: number, r: any) => sum + (r.DiemDanhGia || 0), 0) / v.DanhGias.length
                : 0,

            category:
              v.DanhMuc
                ? {
                    id:
                      v
                        .DanhMuc
                        .MaDanhMuc,

                    name:
                      v
                        .DanhMuc
                        .TenDanhMuc,
                  }
                : null,

            partner:
              v.DoiTac
                ? {
                    id:
                      v
                        .DoiTac
                        .MaDoiTac,

                    name:
                      v
                        .DoiTac
                        .TenDoanhNghiep,
                  }
                : null,
          })
        );

      res.json(mapped);
    } catch (error) {
    console.error('Server error:', error);
      console.error(error);

      res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
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

          TrangThaiVoucher: 'Đang hoạt động',
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
    console.error('Server error:', error);
    console.error(error);

    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};


export const createVoucher = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newVoucher = await VoucherService.createVoucher(data);
    res.status(201).json(newVoucher);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedVoucher = await VoucherService.updateVoucher(parseInt(id, 10), data);
    res.status(200).json(updatedVoucher);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getVouchersByPartnerId = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId, 10);
    const vouchers = await VoucherService.getVouchersByPartnerId(partnerId);
    res.status(200).json(vouchers);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};


export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await VoucherService.softDeleteVoucher(parseInt(id, 10));
    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const restoreVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await VoucherService.restoreVoucher(parseInt(id, 10));
    res.status(200).json({ message: "Voucher restored successfully" });
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const verifyVoucher = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const partnerId = parseInt(req.query.partnerId as string, 10);
    
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "Thiếu thông tin partnerId" });
    }

    const result = await VoucherService.verifyVoucherCode(code, partnerId);
    if (!result) {
      return res.status(404).json({ message: "Voucher không tồn tại hoặc không thuộc đối tác này" });
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const confirmVoucher = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { partnerId, branchId } = req.body;
    
    if (!partnerId) {
      return res.status(400).json({ message: "Thiếu thông tin partnerId" });
    }

    const result = await VoucherService.confirmVoucherUsage(
      code, 
      parseInt(partnerId, 10),
      branchId ? parseInt(branchId, 10) : undefined
    );
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('đã được sử dụng') || error.message.includes('hết hạn')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getVerifyHistory = async (req: Request, res: Response) => {
  try {
    const partnerId = parseInt(req.params.partnerId, 10);
    
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "partnerId không hợp lệ" });
    }

    const history = await VoucherService.getVerificationHistory(partnerId);
    res.status(200).json(history);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const uploadVoucherImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // Create the relative URL to access the uploaded file
    const relativeUrl = `/uploads/vouchers/${req.file.filename}`;
    
    res.status(200).json({ 
      message: 'Voucher image uploaded successfully', 
      imageUrl: relativeUrl 
    });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Error uploading voucher image:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteVoucherImage = async (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image URL provided.' });
    }

    const filename = imageUrl.split('/').pop();
    if (!filename) {
      return res.status(400).json({ message: 'Invalid image URL.' });
    }

    const filePath = path.join(process.cwd(), 'uploads', 'vouchers', filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ message: 'Image deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Image not found on server' });
    }
  } catch (error) {
    console.error('Error deleting voucher image:', error);
    res.status(500).json({ message: 'An error occurred while deleting the image.' });
  }
};
// === Admin functions ===
export const getPendingVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { TrangThaiVoucher: 'Chờ duyệt' },
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
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const approveVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.update({
      where: { VoucherID: Number(id) },
      data: { TrangThaiVoucher: 'Đang hoạt động' }
    });
    logActivity('admin@voucher.vn', 'Phê duyệt voucher', voucher.TenVoucher, req.ip || '127.0.0.1');
    res.json(voucher);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const rejectVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lyDo } = req.body;

    const voucher = await prisma.voucher.update({
      where: { VoucherID: Number(id) },
      data: { TrangThaiVoucher: 'Từ chối' }
    });

    logActivity('admin@voucher.vn', 'Từ chối voucher', `${voucher.TenVoucher} (Lý do: ${lyDo})`, req.ip || '127.0.0.1');
    console.log(`Từ chối voucher ${id} với lý do: ${lyDo}`);
    res.json(voucher);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });

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
                  TrangThaiVoucher: 'Đang hoạt động',
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
    console.error('Server error:', error);
    console.error(error);

    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};


export const searchVouchers =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      // =========================
      // Lấy keyword search
      // Ví dụ:
      // /api/vouchers/search?q=coffee
      // =========================
      const q = String(
        req.query.q || ""
      ).trim();

      // =========================
      // Query tìm kiếm voucher
      // =========================
      const vouchers =
        await prisma.voucher.findMany({
          where: {
            // Chỉ lấy voucher ACTIVE
            TrangThaiVoucher: 'Đang hoạt động',

            // OR:
            // chỉ cần match 1 điều kiện
            OR: [
              // =====================
              // Tìm theo tên voucher
              // =====================
              {
                TenVoucher: {
                  contains: q,
                },
              },

              // =====================
              // Tìm theo tên danh mục
              // =====================
              {
                DanhMuc: {
                  TenDanhMuc: {
                    contains: q,
                  },
                },
              },

              // =====================
              // Tìm theo tên đối tác
              // =====================
              {
                DoiTac: {
                  TenDoanhNghiep:
                    {
                      contains: q,
                    },
                },
              },
            ],
          },

          // Include dữ liệu liên quan
          include: {
            DanhMuc: true,
            DoiTac: true,
          },
        });

      // =========================
      // Convert dữ liệu
      // =========================
      const mapped =
        vouchers.map(
          (v: any) => ({
            id:
              v.VoucherID,

            name:
              v.TenVoucher,

            description:
              v.MoTaVoucher,

            originalPrice:
              Number(
                v.GiaGoc
              ),

            salePrice:
              Number(
                v.GiaBan
              ),

            image:
              v.ImageUrl,

            categoryId:
              v.MaDanhMuc,

            partnerId:
              v.MaDoiTac,

            category:
              v.DanhMuc
                ? {
                    id:
                      v.DanhMuc
                        .MaDanhMuc,

                    name:
                      v.DanhMuc
                        .TenDanhMuc,
                  }
                : null,

            partner:
              v.DoiTac
                ? {
                    id:
                      v.DoiTac
                        .MaDoiTac,

                    name:
                      v.DoiTac
                        .TenDoanhNghiep,
                  }
                : null,
          })
        );

      // Trả dữ liệu về frontend
      res.json(mapped);
    } catch (error) {
    console.error('Server error:', error);
      console.error(error);

      res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
    }
  };

