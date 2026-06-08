import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import * as C from '../controllers/customer.controller';

const router = Router();

// Protect all routes
router.use(requireAuth, requireRole(['customer']));

router.put('/profile', C.updateProfile);
router.put('/password', C.changePassword);

export default router;
