import prisma from './config/db';

async function main() {
  const user = await prisma.taiKhoan.findUnique({
    where: { IDTaiKhoan: 2 }
  });
  if (!user) {
    console.log("User not found");
    return;
  }
  const dbStatus = (user.TrangThaiTaiKhoan || '').trim().toUpperCase();
  const next = dbStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const updated = await prisma.taiKhoan.update({
    where: { IDTaiKhoan: 2 },
    data: { TrangThaiTaiKhoan: next }
  });
  console.log("Updated user in DB:", updated);
}

main().catch(console.error).finally(() => prisma.$disconnect());
