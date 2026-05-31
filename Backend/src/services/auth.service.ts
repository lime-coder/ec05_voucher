import prisma from '../config/db';

export class AuthService {
  static async login(credentials: any) {
    // Check user in database, verify password, return JWT
  }

  static async register(userData: any) {
    // Hash password, create user in database
  }
}
