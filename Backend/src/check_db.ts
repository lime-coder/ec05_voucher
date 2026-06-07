import dotenv from 'dotenv';
import prisma from './config/db';

dotenv.config();

async function main() {
  try {
    const accounts = await prisma.taiKhoan.findMany({
      include: {
        KhachHang: true,
        Admin: true,
        NhanVienDoiTacs: { include: { DoiTac: true } }
      }
    });

    const mapped = accounts.map(u => {
      const phone = u.KhachHang?.SDT_KH || u.Admin?.SDT_Admin || '';

      // Chuẩn hóa: chỉ nhận ACTIVE | INACTIVE | PENDING
      let status: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
      if (u.TrangThaiTaiKhoan === 'LOCKED' || u.TrangThaiTaiKhoan === 'INACTIVE') status = 'INACTIVE';
      else if (u.TrangThaiTaiKhoan === 'PENDING') status = 'PENDING';

      // Loại tài khoản
      let accountType: 'Admin' | 'Partner' | 'Customer' = 'Customer';
      if (u.Admin) accountType = 'Admin';
      else if (u.NhanVienDoiTacs?.length > 0) accountType = 'Partner';

      const partnerStatus = u.NhanVienDoiTacs?.[0]?.DoiTac?.TrangThaiPheDuyet || null;

      return { id: u.IDTaiKhoan, name: u.HoTenNguoiDung || u.TenDangNhap, email: u.Email, phone, status, accountType, partnerStatus, date: '15/03/2026' };
    });
    console.log("Mapped users output:");
    console.dir(mapped, { depth: null });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
