import { Router } from 'express';
import { getLogs } from '../controllers/log.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Only admin can view system logs
router.get('/', requireAuth, requireRole('admin'), getLogs);

export default router;
