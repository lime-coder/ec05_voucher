import prisma from '../config/db';

export class CategoryService {
  static async getAllCategories() {
    return prisma.danhMuc.findMany();
  }
}
