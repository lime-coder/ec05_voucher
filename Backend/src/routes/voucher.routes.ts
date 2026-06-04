import { Router } from 'express';
import { 
  getAllVouchers, 
  getVoucherById, 
  createVoucher, 
  updateVoucher, 
  getVouchersByPartnerId,
  verifyVoucher,
  confirmVoucher,
  getVerifyHistory,
  deleteVoucher,
  restoreVoucher,
  uploadVoucherImage
} from '../controllers/voucher.controller';
import { uploadVoucher } from '../middlewares/upload.middleware';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/', getAllVouchers);
router.get('/partner/:partnerId', getVouchersByPartnerId);

// Verify routes MUST come before /:id to prevent routing conflict
router.get('/verify/history/partner/:partnerId', getVerifyHistory);
router.get('/verify/:code', verifyVoucher);
router.post('/verify/:code/confirm', confirmVoucher);

router.post('/upload-image', uploadVoucher.single('image'), uploadVoucherImage);
router.get('/:id', getVoucherById);
router.post('/', createVoucher);
router.put('/:id', updateVoucher);
router.put('/:id/restore', restoreVoucher);
router.delete('/:id', deleteVoucher);

export default router;
