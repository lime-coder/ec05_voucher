import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import voucherRoutes from './routes/voucher.routes';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
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

// Mount Routes
// E.g., any request to /api/vouchers will be handled by voucherRoutes
app.use('/api/vouchers', voucherRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/categories', categoryRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});
