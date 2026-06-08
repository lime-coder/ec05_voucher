import prisma from '../config/db';

export class CategoryService {
  static async getAllCategories() {
    return prisma.danhMuc.findMany({
      where: {
        NOT: { MoTa: { contains: '"isDeleted":true' } }
      }
    });
  }
}
