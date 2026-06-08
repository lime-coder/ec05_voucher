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

const handleControllerError = (res: Response, error: any, defaultStatus: number = 400) => {
  console.error('Server error:', error);
  const knownErrors = [
    'error.invalid_credentials',
    'Invalid credentials',
    'Username is already taken',
    'Email is already registered',
    'Phone number is already registered',
    'error.user_exists',
    'Registration failed',
    'There has been a problem with your account, please contact customer support for further details',
    'error.invalid_token',
    'User not found'
  ];
  
  if (error && error.message && knownErrors.includes(error.message)) {
    // Map some English messages to semantic keys
    let msg = error.message;
    if (msg === 'Invalid credentials') msg = 'error.invalid_credentials';
    if (msg === 'Username is already taken' || msg === 'Email is already registered' || msg === 'Phone number is already registered') msg = 'error.user_exists';
    if (msg === 'User not found') msg = 'error.user_not_found';
    return res.status(defaultStatus).json({ message: msg });
  }

  // Unknown error
  return res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.' });
};

export const login = async (req: Request, res: Response) => {
  try {
    const ip = extractIP(req);
    const credentials = { ...req.body, ip };
    const result = await AuthService.login(credentials);
    res.status(200).json(result);
  } catch (error: any) {
    handleControllerError(res, error, 401);
  }
};

export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const ip = extractIP(req);
    const result = await AuthService.registerCustomer(req.body, ip);
    res.status(201).json(result);
  } catch (error: any) {
    handleControllerError(res, error, 400);
  }
};

export const checkAvailability = async (req: Request, res: Response) => {
  try {
    const { username, email, phone } = req.body;
    const result = await AuthService.checkAvailability(username, email, phone);
    res.status(200).json(result);
  } catch (error: any) {
    handleControllerError(res, error, 400);
  }
};

export const registerPartner = async (req: Request, res: Response) => {
  try {
    const ip = extractIP(req);
    const result = await AuthService.registerPartner(req.body, ip);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('Server error:', error);
      res.status(409).json({ message: 'error.user_exists' });
    } else {
      handleControllerError(res, error, 400);
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const ip = extractIP(req);
    await AuthService.logout(user.IDTaiKhoan, user.TenDangNhap, ip);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    handleControllerError(res, error, 500);
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await AuthService.me(user.IDTaiKhoan, user.role);
    res.status(200).json(result);
  } catch (error: any) {
    handleControllerError(res, error, 401);
  }
};
