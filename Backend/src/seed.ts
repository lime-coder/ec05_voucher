import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config(); // Load .env
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu sinh dữ liệu test...');

  // 1. Tạo hoặc lấy Partner ID 1
  let partner = await prisma.doiTac.findUnique({ where: { MaDoiTac: 1 } });
  if (!partner) {
    partner = await prisma.doiTac.create({
      data: {
        TenDoanhNghiep: 'Tech Solutions Ltd',
        TrangThaiHoatDong: 'ACTIVE',
        TrangThaiPheDuyet: 'APPROVED'
      }
    });
  }

  // 2. Tạo danh mục nếu chưa có
  const cat = await prisma.danhMuc.upsert({
    where: { MaDanhMuc: 1 },
    update: {},
    create: { TenDanhMuc: 'Công nghệ' }
  });

  // 3. Tạo 2 chi nhánh
  await prisma.chiNhanh.deleteMany({ where: { MaDoiTac: partner.MaDoiTac } });
  const b1 = await prisma.chiNhanh.create({
    data: {
      MaDoiTac: partner.MaDoiTac,
      TenChiNhanh: 'Chi nhánh Quận 1',
      DiaChiChiNhanh: '123 Lê Lợi, Q1, HCM',
    }
  });
  const b2 = await prisma.chiNhanh.create({
    data: {
      MaDoiTac: partner.MaDoiTac,
      TenChiNhanh: 'Chi nhánh Quận 3',
      DiaChiChiNhanh: '456 Võ Văn Tần, Q3, HCM',
    }
  });

  // 4. Xóa dữ liệu cũ (Đơn hàng, ChiTiet, MaVoucher) trước khi xóa Voucher để tránh lỗi FK
  const oldVouchers = await prisma.voucher.findMany({ where: { MaDoiTac: partner.MaDoiTac } });
  const oldVoucherIds = oldVouchers.map(v => v.VoucherID);
  
  const oldCtdh = await prisma.chiTietDonHang.findMany({ where: { VoucherID: { in: oldVoucherIds } } });
  const oldCtdhIds = oldCtdh.map(c => c.MaCTDonHang);
  const oldDonHangIds = [...new Set(oldCtdh.map(c => c.MaDonHang).filter(Boolean))] as number[];

  await prisma.maVoucher.deleteMany({ where: { MaCTDonHang: { in: oldCtdhIds } } });
  await prisma.chiTietDonHang.deleteMany({ where: { VoucherID: { in: oldVoucherIds } } });
  if (oldDonHangIds.length > 0) {
    await prisma.donHang.deleteMany({ where: { MaDonHang: { in: oldDonHangIds } } });
  }

  // Bây giờ an toàn để xóa Vouchers
  await prisma.voucher.deleteMany({ where: { MaDoiTac: partner.MaDoiTac } });

  const vouchers = [];
  for (let i = 1; i <= 5; i++) {
    const v = await prisma.voucher.create({
      data: {
        MaDoiTac: partner.MaDoiTac,
        MaDanhMuc: cat.MaDanhMuc,
        TenVoucher: `Voucher giảm giá ${i * 10}% Tech Solutions`,
        GiaGoc: 100000 * i,
        GiaBan: 80000 * i,
        SoLuongChoPhep: 100 * i,
        TrangThaiVoucher: i % 2 === 0 ? 'DRAFT' : 'ACTIVE',
        ThoiGianBatDau: new Date(),
        ThoiGianKetThuc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        MoTaVoucher: `Đây là mô tả chi tiết cho Voucher giảm giá ${i * 10}%. Áp dụng cho toàn bộ cửa hàng thuộc hệ thống Tech Solutions. Nhanh tay sở hữu ngay!`,
        MoTaDieuKien: `- Áp dụng cho hóa đơn từ 200.000đ\n- Không áp dụng chung với các chương trình khuyến mãi khác\n- Mỗi khách hàng chỉ được sử dụng 1 lần`
      }
    });
    vouchers.push(v);
  }

  // 5. Tạo Khách hàng & Tài khoản
  let tk = await prisma.taiKhoan.findFirst({ where: { TenDangNhap: 'test_user_1' } });
  if (!tk) {
    tk = await prisma.taiKhoan.create({
      data: {
        TenDangNhap: 'test_user_1',
        MatKhau: '123456',
        Email: 'test1@example.com',
        HoTenNguoiDung: 'Nguyễn Văn Test',
        TrangThaiTaiKhoan: 'ACTIVE',
        KhachHang: {
          create: {
            SDT_KH: '0901234567'
          }
        }
      }
    });
  }

  // 6. Tạo Đơn hàng trải đều trong 12 tháng qua để vẽ biểu đồ
  console.log('Tạo đơn hàng 12 tháng...');
  const now = new Date();
  for (let m = 0; m < 12; m++) {
    for (let i = 0; i < 3; i++) { // 3 đơn mỗi tháng
      const orderDate = new Date(now.getTime() - m * 30 * 24 * 60 * 60 * 1000 - i * 5 * 24 * 60 * 60 * 1000);
      const v = vouchers[Math.floor(Math.random() * vouchers.length)];
      
      const order = await prisma.donHang.create({
        data: {
          IDTaiKhoan: tk.IDTaiKhoan,
          ThoiGianThanhToan: orderDate,
          TongTien: v.GiaBan,
          PhuongThucThanhToan: 'VNPAY',
          TrangThaiDonHang: 'COMPLETED',
          TrangThaiThanhToan: 'PAID'
        }
      });

      const ctdh = await prisma.chiTietDonHang.create({
        data: {
          MaDonHang: order.MaDonHang,
          VoucherID: v.VoucherID,
          SoLuongMua: 1,
          ThanhTien: v.GiaBan
        }
      });

      // Tạo mã voucher đã sinh
      await prisma.maVoucher.create({
        data: {
          MaCTDonHang: ctdh.MaCTDonHang,
          SoMaVoucher: nanoid(10).toUpperCase(),
          TrangThaiSuDung: i === 0 ? 'Đã sử dụng' : 'Chưa sử dụng',
          ThoiDiemPhatHanh: orderDate,
          ThoiDiemSuDung: i === 0 ? new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) : null
        }
      });
    }
  }

  console.log('Đã tạo xong dữ liệu Test!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
