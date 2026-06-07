import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import voucherRoutes from './routes/voucher.routes';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import contentRoutes from './routes/content.routes';
import adminRoutes from './routes/admin.routes';
import partnerRoutes from './routes/partner.routes';
import branchRoutes from './routes/branch.routes';
import categoryRoutes from './routes/category.routes';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Allow requests from the React Frontend
app.use(express.json()); // Parse incoming JSON payloads
app.use('/public', express.static(path.join(__dirname, '../public')));

// Disable caching for all API endpoints
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Mount Routes
// E.g., any request to /api/vouchers will be handled by voucherRoutes
app.use('/api/vouchers', voucherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logs', require('./routes/log.routes').default);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// Static uploads serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/partners', partnerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/categories', categoryRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});
