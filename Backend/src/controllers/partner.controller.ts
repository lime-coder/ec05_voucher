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
    console.error('[getPartnerReports ERROR]', error?.message, error?.stack);
    res.status(500).json({ message: 'Internal server error', detail: error?.message || String(error) });
  }
};

export const getPartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await PartnerService.getProfile(parseInt(id, 10));
    if (!profile) return res.status(404).json({ message: "Partner not found" });
    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : String(error) });
  }
};

export const updatePartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await PartnerService.updateProfile(parseInt(id, 10), req.body);
    res.status(200).json({ message: "Profile updated successfully", data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Create the relative URL to access the uploaded file
    const relativeUrl = `/public/uploads/avatars/${req.file.filename}`;

    // Save to database
    const { id } = req.params;
    await PartnerService.updateAvatar(parseInt(id, 10), relativeUrl);

    // Return absolute URL for immediate rendering, but in practice, 
    // the frontend can prepend the host if needed, or we just return relativeUrl
    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: `http://localhost:5000${relativeUrl}`
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Internal server error during upload.' });
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
    res.status(200).json({ message: "Cập nhật mật khẩu thành công." });
  } catch (error: any) {
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
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi khi cập nhật mục tiêu' });
  }
};
