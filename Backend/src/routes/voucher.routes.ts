import { Router } from 'express';
import { 
  getAllVouchers, 
  getVoucherById, 
  createVoucher,
  updateVoucher, 
  getVouchersByPartnerId, 
  getPendingVouchers,
  approveVoucher,
  rejectVoucher, 
  getCategories
} from '../controllers/voucher.controller';


const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/pending', getPendingVouchers);
router.get('/', getAllVouchers);
router.get('/partner/:partnerId', getVouchersByPartnerId);
router.get('/categories', getCategories);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);
router.patch('/:id/approve', approveVoucher);
router.patch('/:id/reject', rejectVoucher);
router.put('/:id', updateVoucher);

export default router;
