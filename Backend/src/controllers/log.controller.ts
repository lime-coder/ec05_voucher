import { Request, Response } from 'express';
import { LogService } from '../services/log.service';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const filters = {
      search: req.query.search as string,
      action: req.query.action as string,
    };

    const logs = await LogService.getLogs(filters);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
