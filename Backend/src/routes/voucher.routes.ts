import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { 
  getAllVouchers, 
  getVoucherById, 
  createVoucher,
  updateVoucher, 
  getVouchersByPartnerId, 
  getPendingVouchers,
  approveVoucher,
  rejectVoucher, 
  getCategories,
  searchVouchers,
  verifyVoucher,
  confirmVoucher,
  getVerifyHistory,
  deleteVoucher,
  restoreVoucher,
  uploadVoucherImage,
  deleteVoucherImage
} from '../controllers/voucher.controller';
import { uploadVoucherMiddleware } from '../middlewares/upload.middleware';

const router = Router();

// Maps HTTP endpoints to specific Controller functions
router.get('/pending', requireAuth, requireRole('admin'), getPendingVouchers);
router.get('/', getAllVouchers);
router.get('/partner/:partnerId', requireAuth, requireRole(['admin', 'partner']), getVouchersByPartnerId);
router.get('/categories', getCategories);
router.get('/search', searchVouchers);

// Verify routes MUST come before /:id to prevent routing conflict
router.get('/verify/history/partner/:partnerId', requireAuth, requireRole('partner'), getVerifyHistory);
router.get('/verify/:code', requireAuth, requireRole('partner'), verifyVoucher);
router.post('/verify/:code/confirm', requireAuth, requireRole('partner'), confirmVoucher);

router.post('/upload-image', requireAuth, requireRole('partner'), uploadVoucherMiddleware, uploadVoucherImage);
router.delete('/upload-image', requireAuth, requireRole('partner'), deleteVoucherImage);
router.get('/:id', getVoucherById);
router.post('/', requireAuth, requireRole('partner'), createVoucher);
router.patch('/:id/approve', requireAuth, requireRole('admin'), approveVoucher);
router.patch('/:id/reject', requireAuth, requireRole('admin'), rejectVoucher);
router.put('/:id', requireAuth, requireRole('partner'), updateVoucher);
router.put('/:id/restore', requireAuth, requireRole('partner'), restoreVoucher);
router.delete('/:id', requireAuth, requireRole('partner'), deleteVoucher);

export default router;
