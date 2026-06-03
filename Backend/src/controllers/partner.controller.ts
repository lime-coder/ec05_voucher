import { Request, Response } from 'express';
import { PartnerService } from '../services/partner.service';

export const getPartnerStatistics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);
    
    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }

    const stats = await PartnerService.getStatistics(partnerId);
    res.status(200).json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
