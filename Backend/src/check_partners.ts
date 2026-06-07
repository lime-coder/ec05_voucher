import prisma from './config/db';

async function main() {
  const partners = await prisma.doiTac.findMany();
  console.log("Raw partners:");
  console.log(partners.map(p => ({ id: p.MaDoiTac, name: p.TenDoanhNghiep, status: p.TrangThaiHoatDong, approval: p.TrangThaiPheDuyet })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
