import { Request, Response } from 'express';
import { BrandService } from '../services/brand.service';

export const getBrandDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);

    if (isNaN(partnerId)) {
      return res.status(400).json({ message: 'Invalid brand ID' });
    }

    const brandData = await BrandService.getBrandDetails(partnerId);

    if (!brandData) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.status(200).json(brandData);
  } catch (error: any) {
    console.error('Error fetching brand details:', error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};
