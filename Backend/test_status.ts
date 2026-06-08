import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('DonHang TrangThaiThanhToan:', await prisma.donHang.findMany({distinct: ['TrangThaiThanhToan'], select: {TrangThaiThanhToan: true}}));
    console.log('DoiTac TrangThaiHoatDong:', await prisma.doiTac.findMany({distinct: ['TrangThaiHoatDong'], select: {TrangThaiHoatDong: true}}));
    console.log('DoiTac TrangThaiPheDuyet:', await prisma.doiTac.findMany({distinct: ['TrangThaiPheDuyet'], select: {TrangThaiPheDuyet: true}}));
    console.log('Voucher TrangThaiVoucher:', await prisma.voucher.findMany({distinct: ['TrangThaiVoucher'], select: {TrangThaiVoucher: true}}));
    console.log('TaiKhoan TrangThaiTaiKhoan:', await prisma.taiKhoan.findMany({distinct: ['TrangThaiTaiKhoan'], select: {TrangThaiTaiKhoan: true}}));
}

main().catch(console.error).finally(() => prisma.$disconnect());
