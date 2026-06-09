import { Request } from 'express';
import { LogService } from '../../services/log.service';
import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'logs.json');

export const deleteImageFile = (imagePath: string | null | undefined) => {
  if (!imagePath || imagePath.startsWith('http')) return;
  try {
    const filePath = path.join(process.cwd(), 'uploads', imagePath.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.error('Delete image error:', e);
  }
};

export const logActivity = (req: Request | any, action: string, target: string, status: string = 'Thành công') => {
  try {
    const user = req?.user?.TenDangNhap || 'admin@voucher.vn';
    const ip = req?.ip || '127.0.0.1';

    let logs = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(data || '[]');
    }
    const newLog = {
      id: logs.length + 1,
      user,
      action,
      target,
      ip,
      time: new Date().toLocaleString('vi-VN'),
      status
    };
    logs.unshift(newLog);
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');

    // SystemLog
    LogService.createLog({
      IDTaiKhoan: req?.user?.IDTaiKhoan || null,
      HanhDong: action,
      DoiTuong: target,
      ChiTiet: `Thực hiện bởi: ${user}. Đối tượng: ${target}`,
      DiaChiIP: ip,
      TrangThai: status
    }).catch(console.error);
  } catch (err) {
    console.error('Failed to write system log:', err);
  }
};

export * from './admin.user.controller';
export * from './admin.dashboard.controller';
export * from './admin.content.controller';
export * from './admin.partner.controller';
export * from './admin.order.controller';
export * from './admin.profile.controller';
export * from './admin.notification.controller';
export * from './admin.voucher.controller';
export * from './admin.log.controller';

// Keep the re-exports that were originally at the bottom of admin.controller.ts
export { approveVoucher, rejectVoucher } from '../voucher.controller';
