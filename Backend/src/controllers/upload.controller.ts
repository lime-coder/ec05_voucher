import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

// Ensure uploads folder exists in the project root
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ cho phép tải lên file hình ảnh (jpg, jpeg, png, gif, webp)!'));
  }
});

const uploadSingle = upload.single('image');

export const uploadImage = (req: Request, res: Response): any => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Lỗi tải ảnh lên' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Không có file' });
    }
    res.json({ path: `/uploads/${req.file.filename}` });
  });
};
