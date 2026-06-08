import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { getPartnerStatistics, getPartnerReports, getPartnerProfile, updatePartnerProfile, uploadAvatar, changePartnerPassword, updateRevenueTarget } from '../controllers/partner.controller';
import { uploadAvatarMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(requireAuth, requireRole(['partner', 'admin']));

// Lấy thống kê của một Partner cụ thể (dành cho Dashboard)
router.get('/:id/statistics', getPartnerStatistics);

// Lấy dữ liệu báo cáo chi tiết cho trang Báo cáo & Thống kê
router.get('/:id/reports', getPartnerReports);

// Cài đặt tài khoản (Profile)
router.get('/:id/profile', getPartnerProfile);
router.put('/:id/profile', updatePartnerProfile);
router.post('/:id/upload-avatar', uploadAvatarMiddleware, uploadAvatar);
router.put('/:id/password', changePartnerPassword);
router.put('/:id/revenue-target', updateRevenueTarget);

export default router;
