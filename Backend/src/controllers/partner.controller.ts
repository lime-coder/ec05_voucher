import { Request, Response } from 'express';
import { PartnerService } from '../services/partner.service';
import { LogService } from '../services/log.service';

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
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getPartnerReports = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);
    const timeRange = (req.query.timeRange as string) || 'month';

    if (isNaN(partnerId)) {
      return res.status(400).json({ message: "Invalid partner ID" });
    }

    const reports = await PartnerService.getReports(partnerId, timeRange);
    res.status(200).json(reports);
  } catch (error: any) {
    console.error('Server error:', error);
    console.error('[getPartnerReports ERROR]', error?.message, error?.stack);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getPartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await PartnerService.getProfile(parseInt(id, 10));
    if (!profile) return res.status(404).json({ message: "Partner not found" });
    res.status(200).json(profile);
  } catch (error) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updatePartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await PartnerService.updateProfile(parseInt(id, 10), req.body);
    
    await LogService.createLog({
      IDTaiKhoan: (req as any).user?.IDTaiKhoan || null,
      HanhDong: 'Cập nhật Profile Partner',
      DoiTuong: `Partner ID: ${id}`,
      ChiTiet: 'Partner updated their profile information.',
      DiaChiIP: req.ip || '127.0.0.1',
      TrangThai: 'Thành công'
    });

    res.status(200).json({ message: "Profile updated successfully", data: updated });
  } catch (error) {
    console.error('Server error:', error);
    console.error(error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Create the relative URL to access the uploaded file
    const relativeUrl = `/uploads/avatars/${req.file.filename}`;

    // Save to database
    const { id } = req.params;
    await PartnerService.updateAvatar(parseInt(id, 10), relativeUrl);

    await LogService.createLog({
      IDTaiKhoan: (req as any).user?.IDTaiKhoan || null,
      HanhDong: 'Cập nhật Avatar Partner',
      DoiTuong: `Partner ID: ${id}`,
      ChiTiet: `Uploaded new avatar: ${relativeUrl}`,
      DiaChiIP: req.ip || '127.0.0.1',
      TrangThai: 'Thành công'
    });

    // Return absolute URL for immediate rendering, but in practice, 
    // the frontend can prepend the host if needed, or we just return relativeUrl
    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: `http://localhost:5000${relativeUrl}`
    });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Error uploading avatar:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const changePartnerPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Thiếu thông tin mật khẩu." });
    }

    await PartnerService.changePassword(parseInt(id, 10), currentPassword, newPassword);
    
    await LogService.createLog({
      IDTaiKhoan: (req as any).user?.IDTaiKhoan || null,
      HanhDong: 'Đổi mật khẩu Partner',
      DoiTuong: `Partner ID: ${id}`,
      ChiTiet: 'Partner changed their password.',
      DiaChiIP: req.ip || '127.0.0.1',
      TrangThai: 'Thành công'
    });

    res.status(200).json({ message: "Cập nhật mật khẩu thành công." });
  } catch (error: any) {
    console.error('Server error:', error);
    console.error('Error changing password:', error);
    res.status(400).json({ message: error.message || "Lỗi khi cập nhật mật khẩu." });
  }
};

export const updateRevenueTarget = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);
    const { timeRange, target } = req.body;

    if (isNaN(partnerId)) return res.status(400).json({ message: 'Invalid partner ID' });
    if (!timeRange || target === undefined) return res.status(400).json({ message: 'Thiếu timeRange hoặc target' });

    const result = PartnerService.updateRevenueTarget(partnerId, timeRange, Number(target));
    
    LogService.createLog({
      IDTaiKhoan: (req as any).user?.IDTaiKhoan || null,
      HanhDong: 'Cập nhật mục tiêu doanh thu',
      DoiTuong: `Partner ID: ${id}`,
      ChiTiet: `Target: ${target}, TimeRange: ${timeRange}`,
      DiaChiIP: req.ip || '127.0.0.1',
      TrangThai: 'Thành công'
    }).catch(console.error);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Server error:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi cập nhật mục tiêu' });
  }
};

export const getStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);
    if (isNaN(partnerId)) return res.status(400).json({ message: 'Invalid partner ID' });

    const staffList = await PartnerService.getStaff(partnerId);
    res.status(200).json(staffList);
  } catch (error: any) {
    console.error('Server error:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi lấy danh sách nhân viên' });
  }
};

export const createStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = parseInt(id, 10);
    const { username, password, email, fullName, position } = req.body;

    if (isNaN(partnerId)) return res.status(400).json({ message: 'Invalid partner ID' });
    if (!username || !password || !email) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

    const newStaff = await PartnerService.createStaff(partnerId, { username, password, email, fullName, position });

    res.status(201).json({ message: "Tạo nhân viên thành công", data: newStaff });
  } catch (error: any) {
    console.error('Server error:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi tạo nhân viên' });
  }
};
