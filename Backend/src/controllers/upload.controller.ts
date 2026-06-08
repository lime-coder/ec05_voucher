import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response): any => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file' });
  }
  res.json({ path: `/uploads/general/${req.file.filename}` });
};

import fs from 'fs';
import path from 'path';

export const deleteUploadedImage = (req: Request, res: Response): any => {
  try {
    const { imagePath } = req.body;
    if (!imagePath || imagePath.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid path' });
    }
    const normalizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const filePath = path.join(process.cwd(), normalizedPath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ message: 'Deleted successfully' });
    }
    return res.status(404).json({ error: 'File not found' });
  } catch (error) {
    console.error('Delete uploaded image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
