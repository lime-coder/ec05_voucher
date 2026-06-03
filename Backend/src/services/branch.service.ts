import prisma from '../config/db';

export class BranchService {
  // Lấy danh sách chi nhánh của một đối tác
  static async getBranchesByPartner(partnerId: number) {
    return prisma.chiNhanh.findMany({
      where: {
        MaDoiTac: partnerId
      }
    });
  }

  // Thêm mới chi nhánh cho đối tác
  static async createBranch(partnerId: number, data: { tenChiNhanh: string; sdt?: string; diaChi?: string }) {
    return prisma.chiNhanh.create({
      data: {
        MaDoiTac: partnerId,
        TenChiNhanh: data.tenChiNhanh,
        SDT_CN: data.sdt || null,
        DiaChiChiNhanh: data.diaChi || null,
      }
    });
  }

  // Cập nhật thông tin chi nhánh
  static async updateBranch(branchId: number, data: { tenChiNhanh?: string; sdt?: string; diaChi?: string }) {
    return prisma.chiNhanh.update({
      where: { MaChiNhanh: branchId },
      data: {
        TenChiNhanh: data.tenChiNhanh,
        SDT_CN: data.sdt,
        DiaChiChiNhanh: data.diaChi,
      }
    });
  }

  // Xóa chi nhánh
  static async deleteBranch(branchId: number) {
    return prisma.chiNhanh.delete({
      where: { MaChiNhanh: branchId }
    });
  }
}
