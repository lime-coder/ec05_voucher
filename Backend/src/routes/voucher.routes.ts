import { Router } from 'express';
import { getAllVouchers, getVoucherById, createVoucher, searchVoucher } from '../controllers/voucher.controller';
import { 
  getAllVouchers, 
  getVoucherById, 
  createVoucher,
  getPendingVouchers,
  approveVoucher,
  rejectVoucher 
} from '../controllers/voucher.controller';
import { getAllVouchers, getVoucherById, createVoucher, updateVoucher, getVouchersByPartnerId } from '../controllers/voucher.controller';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/pending', getPendingVouchers);
router.get('/', getAllVouchers);
router.get('/search', searchVoucher);
router.get('/partner/:partnerId', getVouchersByPartnerId);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);
router.patch('/:id/approve', approveVoucher);
router.patch('/:id/reject', rejectVoucher);
router.put('/:id', updateVoucher);

export default router;
