import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import { getBranchesByPartner, createBranch, updateBranch, deleteBranch } from '../controllers/branch.controller';

const router = Router();

router.use(requireAuth, requireRole(['partner', 'admin']));

// Lấy danh sách chi nhánh của 1 partner
router.get('/partner/:partnerId', getBranchesByPartner);

// Tạo chi nhánh mới cho 1 partner
router.post('/partner/:partnerId', createBranch);

// Cập nhật thông tin chi nhánh
router.put('/:id', updateBranch);

// Xóa chi nhánh
router.delete('/:id', deleteBranch);

export default router;
