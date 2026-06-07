import { Router } from 'express';
import {
  getUsers, toggleUserActive,
  getAdminVouchers, approveVoucher, rejectVoucher, suspendVoucher, restoreVoucher,
  getAllOrders, updateOrderStatus,
  getContent, createContent, updateContent, deleteContent,
  getPartners, createPartner, updatePartner, deletePartner,
  togglePartnerActive, approvePartner, rejectPartner, getPartnerBranchStats,
  getDashboardStats, getLogs,
  getAdminProfile, updateAdminProfile, updateAdminPassword,
  getAdminNotifications,
} from '../controllers/admin.controller';

const router = Router();

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserActive);

// Vouchers (admin view)
router.get('/vouchers', getAdminVouchers);
router.patch('/vouchers/:id/approve', approveVoucher);
router.patch('/vouchers/:id/reject', rejectVoucher);
router.patch('/vouchers/:id/suspend', suspendVoucher);   // ← route mới
router.patch('/vouchers/:id/restore', restoreVoucher);


// Orders (filter ngày qua query: ?startDate=&endDate=&status=)
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

// Content
router.get('/content', getContent);
router.post('/content', createContent);
router.put('/content/:id', updateContent);
router.delete('/content/:id', deleteContent);

// Partners
router.get('/partners', getPartners);
router.post('/partners', createPartner);
router.put('/partners/:id', updatePartner);
router.delete('/partners/:id', deletePartner);
router.patch('/partners/:id/toggle', togglePartnerActive);
router.patch('/partners/:id/approve', approvePartner);
router.patch('/partners/:id/reject', rejectPartner);
router.get('/partners/:partnerId/branch-stats', getPartnerBranchStats);

// System logs
router.get('/logs', getLogs);

// Admin profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/profile/password', updateAdminPassword);

// Notifications
router.get('/notifications', getAdminNotifications);

export default router;
