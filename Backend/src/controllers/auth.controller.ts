import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * Helper: extract and normalize IP from request.
 */
function extractIP(req: Request): string {
  let ip = (req.ip || req.connection.remoteAddress || '').toString();
  if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('127.0.0.1') || ip === '::ffff::1') {
    ip = '127.0.0.1';
  }
  return ip;
}

export const login = async (req: Request, res: Response) => {
  try {
    const ip = extractIP(req);
    const credentials = { ...req.body, ip };
    const result = await AuthService.login(credentials);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Invalid credentials' });
  }
};

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const ip = extractIP(req);
    const result = await AuthService.registerCustomer(req.body, ip);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { username, email, phone } = req.body;
    const result = await AuthService.checkAvailability(username, email, phone);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const registerPartner = async (req: Request, res: Response) => {
  try {
    const ip = extractIP(req);
    const result = await AuthService.registerPartner(req.body, ip);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Username or Email already exists' });
    } else {
      res.status(400).json({ message: error.message || 'Registration failed' });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const ip = extractIP(req);
    await AuthService.logout(user.IDTaiKhoan, user.TenDangNhap, ip);
    res.status(200).json({ message: 'Đăng xuất thành công' });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
