import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  try {
    let ip = (req.ip || req.connection.remoteAddress || '').toString();
    // Normalize IPv6 localhost and IPv4-mapped localhost to 127.0.0.1
    if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('127.0.0.1') || ip === '::ffff::1') {
      ip = '127.0.0.1';
    }
    const credentials = { ...req.body, ip };
    const result = await AuthService.login(credentials);
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
