import { Router } from 'express';
import * as A from '../controllers/admin.controller';

const router = Router();

// === Quản lý người dùng ===
router.get('/users', A.getUsers);
router.patch('/users/:id/toggle', A.toggleUserActive);

// === Quản lý đối tác ===
router.get('/partners', A.getPartners);
router.post('/partners', A.createPartner);
router.put('/partners/:id', A.updatePartner);
router.delete('/partners/:id', A.deletePartner);
router.patch('/partners/:id/approve', A.approvePartner);
router.patch('/partners/:id/reject', A.rejectPartner);

// === Quản lý đơn hàng ===
router.get('/orders', A.getAllOrders);
router.patch('/orders/:id/status', A.updateOrderStatus);

// === Admin Vouchers ===
router.get('/vouchers', A.getAdminVouchers);

// === System Logs ===
router.get('/logs', A.getLogs);

// === Thống kê Dashboard ===
router.get('/dashboard/stats', A.getDashboardStats);

// === Admin Profile ===
router.get('/profile', A.getAdminProfile);
router.put('/profile', A.updateAdminProfile);
router.put('/profile/password', A.updateAdminPassword);

// === Quản lý nội dung (CRUD) ===
router.get('/content', A.getContent);
router.post('/content', A.createContent);
router.put('/content/:id', A.updateContent);
router.delete('/content/:id', A.deleteContent);

export default router;
