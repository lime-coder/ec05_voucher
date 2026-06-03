import { Request, Response } from 'express';
import { VoucherService } from '../services/voucher.service';

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

      const vouchers =
        await VoucherService.getAllVouchers();

      return res.status(200).json(
        vouchers
      );

    } catch (error: any) {

      return res.status(500).json({
        message: error.message,
      });

    }
  };

/**
 * Search voucher
 */
  export const searchVoucher =
    async (
      req: Request,
      res: Response
    ) => {

      try {

        // Keyword
        const keyword =
          String(
            req.query.keyword || ""
          );

        // Min price
        const minPrice =
          req.query.minPrice

            ? Number(
                req.query.minPrice
              )

            : undefined;

        // Max price
        const maxPrice =
          req.query.maxPrice

            ? Number(
                req.query.maxPrice
              )

            : undefined;

        // Category
        const category =
          req.query.category

            ? String(
                req.query.category
              )

            : undefined;

        // Brand
        const brand =
          req.query.brand

            ? String(
                req.query.brand
              )

            : undefined;

        // Call service
        const vouchers =
          await VoucherService.searchVoucher(

            keyword,

            minPrice,

            maxPrice,

            category,

            brand,
          );

        // Response
        return res.status(200).json(
          vouchers
        );

      } catch (error: any) {

        console.error(error);

        return res.status(500).json({

          message:
            error.message,

        });

      }
    };



// GET voucher detail

export const getVoucherById =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const voucher =
        await VoucherService.getVoucherById(
          req.params.id
        );

      return res.status(200).json(
        voucher
      );

    } catch (error: any) {

      return res.status(500).json({
        message: error.message,
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


