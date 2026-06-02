import { Router } from 'express';
import { getAllVouchers, getVoucherById, createVoucher, updateVoucher, getVouchersByPartnerId } from '../controllers/voucher.controller';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/', getAllVouchers);
router.get('/partner/:partnerId', getVouchersByPartnerId);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);
router.put('/:id', updateVoucher);

export default router;
