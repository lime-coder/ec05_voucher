import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const createUploadMiddleware = (folder: string, fieldName: string) => {
  const uploadDir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, JPG, GIF, WEBP are allowed.'));
      }
    }
  }).single(fieldName);

  return (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(400).json({ error: err.message || 'Lỗi tải ảnh lên' });
      }
      next();
    });
  };
};

export const uploadAvatarMiddleware = createUploadMiddleware('avatars', 'avatar');
export const uploadVoucherMiddleware = createUploadMiddleware('vouchers', 'image');
export const uploadGeneralMiddleware = createUploadMiddleware('general', 'image');
