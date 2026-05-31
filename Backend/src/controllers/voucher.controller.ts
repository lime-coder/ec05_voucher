import { Request, Response } from 'express';
import { VoucherService } from '../services/voucher.service';

/**
 * Controller handles the HTTP Request/Response flow.
 * It extracts data from 'req' and calls the appropriate Service function.
 */
export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    // const vouchers = await VoucherService.getAllVouchers();
    // res.status(200).json(vouchers);
  } catch (error) {
    // res.status(500).json({ message: "Internal server error" });
  }
};

export const getVoucherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // const voucher = await VoucherService.getVoucherById(id);
    // res.status(200).json(voucher);
  } catch (error) {
    // res.status(500).json({ message: "Internal server error" });
  }
};

export const createVoucher = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // const newVoucher = await VoucherService.createVoucher(data);
    // res.status(201).json(newVoucher);
  } catch (error) {
    // res.status(500).json({ message: "Internal server error" });
  }
};
