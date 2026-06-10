import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';

import { createOrder, getOrderDetail, getOrders, getOrdersByCustomer, getOrderDetailById, confirmOrderPayment, cancelOrderPayment} from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

// router.get('/', getAllOrders);
// router.post('/:id/pay', payOrder);
// Thanh toán 
router.post( "/", createOrder );
router.patch("/:id/payment/confirm", confirmOrderPayment);
router.patch("/:id/payment/cancel", cancelOrderPayment);
router.get(  "/", getOrders);
router.get(
  "/customer/:customerId",
  getOrdersByCustomer
);


router.get(
  "/order-details/:id",
  getOrderDetailById
);

router.get(
  "/:id",
  getOrderDetail
);

export default router;
