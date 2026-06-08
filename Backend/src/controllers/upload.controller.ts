import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response): any => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file' });
  }
  res.json({ path: `/uploads/general/${req.file.filename}` });
};
