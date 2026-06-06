import { Router } from 'express';

import { createOrder, getOrderDetail, getOrders, getOrdersByCustomer} from "../controllers/order.controller";

const router = Router();

// router.get('/', getAllOrders);
// router.post('/:id/pay', payOrder);
// Thanh toán 
router.post( "/", createOrder );
router.get(  "/", getOrders);
router.get(
  "/customer/:customerId",
  getOrdersByCustomer
);
router.get(
  "/:id",
  getOrderDetail
);

export default router;
