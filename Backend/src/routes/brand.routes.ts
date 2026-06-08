import { Router } from 'express';
import { getBrandDetails } from '../controllers/brand.controller';

const router = Router();

// Public route to fetch brand/store details
router.get('/:id', getBrandDetails);

export default router;
