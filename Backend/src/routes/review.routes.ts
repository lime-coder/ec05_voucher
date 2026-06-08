import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import * as C from '../controllers/review.controller';

const router = Router();

// Protect route
router.use(requireAuth, requireRole(['customer']));

router.post('/', C.createReview);

export default router;
