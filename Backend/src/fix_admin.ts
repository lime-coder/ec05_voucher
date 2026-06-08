import prisma from './config/db';

async function main() {
  const adminUser = await prisma.taiKhoan.findUnique({
    where: { TenDangNhap: 'admin' }
  });

  if (adminUser) {
    const updated = await prisma.taiKhoan.update({
      where: { IDTaiKhoan: adminUser.IDTaiKhoan },
      data: { TrangThaiTaiKhoan: 'Hoạt động' }
    });
    console.log("Admin account status updated to ACTIVE:", updated);
  } else {
    console.log("Admin account not found");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
