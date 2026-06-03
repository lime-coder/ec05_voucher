import { Router } from 'express';
import { getAllVouchers, getVoucherById, createVoucher, searchVoucher } from '../controllers/voucher.controller';
import { getAllVouchers, getVoucherById, createVoucher, updateVoucher, getVouchersByPartnerId } from '../controllers/voucher.controller';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/', getAllVouchers);
router.get('/search', searchVoucher);
router.get('/partner/:partnerId', getVouchersByPartnerId);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);
router.put('/:id', updateVoucher);

export default router;
