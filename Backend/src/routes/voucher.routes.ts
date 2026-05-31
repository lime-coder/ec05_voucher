import { Router } from 'express';
import { getAllVouchers, getVoucherById, createVoucher } from '../controllers/voucher.controller';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/', getAllVouchers);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);

export default router;
