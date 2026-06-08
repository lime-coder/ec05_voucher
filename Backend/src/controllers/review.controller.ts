import { Request, Response } from 'express';
import prisma from '../config/db';

export const createReview = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user?.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: "Unauthorized" });

    const { voucherId, rating, comment } = req.body;

    if (!voucherId || !rating) {
      return res.status(400).json({ message: "Thiếu thông tin đánh giá" });
    }

    // 1. Check if the customer has purchased this voucher AND the order is COMPLETED
    const orderDetails = await prisma.chiTietDonHang.findMany({
      where: {
        VoucherID: Number(voucherId),
        DonHang: {
          IDTaiKhoan: customerId,
          TrangThaiDonHang: 'Hoàn tất'
        }
      },
      include: {
        MaVouchers: true
      }
    });

    if (orderDetails.length === 0) {
      return res.status(403).json({ message: "Bạn chỉ có thể đánh giá voucher đã mua và thanh toán thành công" });
    }

    // 2. Check if at least one voucher has been USED (TrangThaiSuDung === 'DaSuDung')
    let hasUsedVoucher = false;
    for (const detail of orderDetails) {
      if (detail.MaVouchers.some(mv => mv.TrangThaiSuDung === 'DaSuDung')) {
        hasUsedVoucher = true;
        break;
      }
    }

    if (!hasUsedVoucher) {
      return res.status(403).json({ message: "Bạn chỉ có thể đánh giá voucher sau khi đã sử dụng" });
    }

    // 3. Create the review
    const newReview = await prisma.danhGia.create({
      data: {
        VoucherID: Number(voucherId),
        IDTaiKhoan: customerId,
        DiemDanhGia: Number(rating),
        NoiDung: comment || "",
      }
    });

    res.status(201).json({ message: "Đánh giá thành công", review: newReview });
  } catch (error) {
    console.error('Server error:', error);
    console.error("Lỗi khi đánh giá:", error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};
