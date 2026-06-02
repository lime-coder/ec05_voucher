import { Router } from 'express';
import { getPartnerStatistics } from '../controllers/partner.controller';

const router = Router();

// Lấy thống kê của một Partner cụ thể (dành cho Dashboard)
router.get('/:id/statistics', getPartnerStatistics);

export default router;
