import { Request, Response } from 'express';
import { VoucherService } from '../services/voucher.service';

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
