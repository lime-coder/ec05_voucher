import { Router } from 'express';
import * as C from '../controllers/content.controller';
import { upload, uploadImage } from '../controllers/upload.controller';

const router = Router();

// === FAQ ===
router.get('/faqs', C.getFAQs);
router.post('/faqs', C.createFAQ);
router.put('/faqs/:id', C.updateFAQ);
router.delete('/faqs/:id', C.deleteFAQ);

// === Banners ===
router.get('/banners', C.getBanners);
router.post('/banners', C.createBanner);
router.put('/banners/:id', C.updateBanner);
router.delete('/banners/:id', C.deleteBanner);

// === Bài Viết ===
router.get('/baiviet', C.getBaiViets);
router.post('/baiviet', C.createBaiViet);
router.put('/baiviet/:id', C.updateBaiViet);
router.delete('/baiviet/:id', C.deleteBaiViet);

// === Danh mục ===
router.get('/categories', C.getCategories);
router.post('/categories', C.createCategory);
router.put('/categories/:id', C.updateCategory);
router.delete('/categories/:id', C.deleteCategory);

// === Upload ===
router.post('/upload', uploadImage);

export default router;
