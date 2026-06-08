import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import * as C from '../controllers/cart.controller';

const router = Router();

// Protect all routes
router.use(requireAuth, requireRole(['customer']));

router.get('/', C.getCart);
router.post('/sync', C.syncCart);
router.post('/items', C.addItem);
router.put('/items/:voucherId', C.updateItem);
router.delete('/items/:voucherId', C.removeItem);
router.delete('/', C.clearCart);

export default router;
