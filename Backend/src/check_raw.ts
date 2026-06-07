import prisma from './config/db';

async function main() {
  const accounts = await prisma.taiKhoan.findMany();
  console.log("Raw accounts:");
  console.log(accounts.map(a => ({ id: a.IDTaiKhoan, username: a.TenDangNhap, status: a.TrangThaiTaiKhoan })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
