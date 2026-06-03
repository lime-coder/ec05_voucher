import { Router } from 'express';
import { 
  getAllVouchers, 
  getVoucherById, 
  createVoucher,
  getPendingVouchers,
  approveVoucher,
  rejectVoucher 
} from '../controllers/voucher.controller';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/pending', getPendingVouchers);
router.get('/', getAllVouchers);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);
router.patch('/:id/approve', approveVoucher);
router.patch('/:id/reject', rejectVoucher);

export default router;
