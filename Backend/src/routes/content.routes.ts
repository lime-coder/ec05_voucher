import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import * as C from '../controllers/content.controller';
import { uploadImage, deleteUploadedImage } from '../controllers/upload.controller';
import { uploadGeneralMiddleware } from '../middlewares/upload.middleware';

const router = Router();

const adminAuth = [requireAuth, requireRole('admin')];

// === FAQ ===
router.get('/faqs', C.getFAQs);
router.post('/faqs', adminAuth, C.createFAQ);
router.put('/faqs/:id', adminAuth, C.updateFAQ);
router.delete('/faqs/:id', adminAuth, C.deleteFAQ);

// === Banners ===
router.get('/banners', C.getBanners);
router.post('/banners', adminAuth, C.createBanner);
router.put('/banners/:id', adminAuth, C.updateBanner);
router.delete('/banners/:id', adminAuth, C.deleteBanner);

// === Bài Viết ===
router.get('/baiviet', C.getBaiViets);
router.post('/baiviet', adminAuth, C.createBaiViet);
router.put('/baiviet/:id', adminAuth, C.updateBaiViet);
router.delete('/baiviet/:id', adminAuth, C.deleteBaiViet);
router.post('/baiviet/:id/view', C.incrementBaiVietView);

// === Danh mục ===
router.get('/categories', C.getCategories);
router.post('/categories', adminAuth, C.createCategory);
router.put('/categories/:id', adminAuth, C.updateCategory);
router.delete('/categories/:id', adminAuth, C.deleteCategory);

// === Upload ===
router.post('/upload', requireAuth, requireRole('admin'), uploadGeneralMiddleware, uploadImage);
router.delete('/upload', requireAuth, requireRole('admin'), deleteUploadedImage);

export default router;
