import { Request, Response } from 'express';
import { VoucherService } from '../services/voucher.service';
import prisma from '../config/db';
import { logActivity } from './admin.controller';

/**
 * Controller handles the HTTP Request/Response flow.
 * It extracts data from 'req' and calls the appropriate Service function.
 */
export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await VoucherService.getAllVouchers();
    res.status(200).json(vouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVoucherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await VoucherService.getVoucherById(parseInt(id, 10));
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.status(200).json(voucher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
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


export const deleteVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await VoucherService.softDeleteVoucher(parseInt(id, 10));
    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const restoreVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await VoucherService.restoreVoucher(parseInt(id, 10));
    res.status(200).json({ message: "Voucher restored successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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
    console.error(error);
    if (error.message.includes('không tồn tại')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('đã được sử dụng') || error.message.includes('hết hạn')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error", error: error.message });
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
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const uploadVoucherImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // Create the relative URL to access the uploaded file
    const relativeUrl = `/public/uploads/vouchers/${req.file.filename}`;
    
    res.status(200).json({ 
      message: 'Voucher image uploaded successfully', 
      imageUrl: relativeUrl 
    });
  } catch (error) {
    console.error('Error uploading voucher image:', error);
    res.status(500).json({ message: 'Internal server error during upload.' });
  }
};
// === Admin functions ===
export const getPendingVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      where: { TrangThaiVoucher: 'PENDING_APPROVAL' },
      include: { DoiTac: true }
    });

    const mapped = vouchers.map(v => {
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
