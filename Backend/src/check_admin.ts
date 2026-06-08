import prisma from './config/db';

async function main() {
  const adminUser = await prisma.taiKhoan.findUnique({
    where: { TenDangNhap: 'admin' }
  });

  console.log("Admin account:", adminUser);
}

main().catch(console.error).finally(() => prisma.$disconnect());
