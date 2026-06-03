import dotenv from 'dotenv';
import prisma from './config/db';

dotenv.config();

async function main() {
  console.log("Checking database connection and records...");
  try {
    const vouchersCount = await prisma.voucher.count();
    console.log("Vouchers count:", vouchersCount);

    const taiKhoanCount = await prisma.taiKhoan.count();
    console.log("TaiKhoan count:", taiKhoanCount);

    const faqCount = await prisma.fAQ.count();
    console.log("FAQ count:", faqCount);

    const bannerCount = await prisma.banner.count();
    console.log("Banner count:", bannerCount);

    const baiVietCount = await prisma.baiViet.count();
    console.log("BaiViet count:", baiVietCount);

    const doiTacCount = await prisma.doiTac.count();
    console.log("DoiTac count:", doiTacCount);

    const donHangCount = await prisma.donHang.count();
    console.log("DonHang count:", donHangCount);

    const chiTietDonHangCount = await prisma.chiTietDonHang.count();
    console.log("ChiTietDonHang count:", chiTietDonHangCount);

    const paidCount = await prisma.donHang.count({ where: { TrangThaiThanhToan: 'Đã thanh toán' } });
    console.log("Paid orders count:", paidCount);

    const pendingCount = await prisma.donHang.count({ where: { TrangThaiThanhToan: 'Chờ thanh toán' } });
    console.log("Pending orders count:", pendingCount);

    const oldestOrder = await prisma.donHang.findFirst({ orderBy: { MaDonHang: 'asc' } });
    console.log("Oldest order:", oldestOrder ? oldestOrder.ThoiGianThanhToan : 'None');

    const newestOrder = await prisma.donHang.findFirst({ orderBy: { MaDonHang: 'desc' } });
    console.log("Newest order:", newestOrder ? newestOrder.ThoiGianThanhToan : 'None');

    const sampleAccounts = await prisma.taiKhoan.findMany({ take: 3 });
    console.log("Sample accounts:", sampleAccounts);
  } catch (err) {
    console.error("Error connecting to database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
