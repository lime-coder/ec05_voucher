import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Invalid credentials' });
  }
};

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerCustomer(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Username, Email, or Phone already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const registerPartner = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.registerPartner(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Username or Email already exists' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
