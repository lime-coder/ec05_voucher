import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'logs.json');

export const getLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(data || '[]');
    } else {
      logs = [
        { id: 1, user: 'admin@voucher.vn', action: 'Phê duyệt voucher', target: 'Highlands Coffee - Giảm 50K', ip: '127.0.0.1', time: new Date().toLocaleString('vi-VN'), status: 'Thành công' },
        { id: 2, user: 'admin@voucher.vn', action: 'Kích hoạt hệ thống', target: 'Dashboard', ip: '127.0.0.1', time: new Date().toLocaleString('vi-VN'), status: 'Thành công' }
      ];
      fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    }
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
