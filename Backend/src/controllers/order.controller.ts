import { Request, Response } from 'express';

export const getAllOrders = async (req: Request, res: Response) => {
  // Extract query params and call orderService.getAllOrders()
};

export const payOrder = async (req: Request, res: Response) => {
  // Extract order ID and payment details, call orderService.payOrder()
};
