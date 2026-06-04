import { Request, Response } from 'express';
import prisma from '../config/db';
import fs from 'fs';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'logs.json');

export const logActivity = (user: string, action: string, target: string, ip: string, status: string = 'Thành công') => {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(data || '[]');
    }
    const newLog = {
      id: logs.length + 1,
      user,
      action,
      target,
      ip,
      time: new Date().toLocaleString('vi-VN'),
      status
    };
    logs.unshift(newLog);
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write system log:', err);
  }
};

// === Quản lý người dùng ===
export const getUsers = async (req: Request, res: Response) => {
  try {
    const accounts = await prisma.taiKhoan.findMany({
      include: {
        KhachHang: true,
        Admin: true
      }
    });

    const mappedUsers = accounts.map(u => {
      const phone = u.KhachHang?.SDT_KH || u.Admin?.SDT_Admin || '';
      const status = u.TrangThaiTaiKhoan === 'LOCKED' ? 'LOCKED' : 'ACTIVE';
      return {
        id: u.IDTaiKhoan,
        name: u.HoTenNguoiDung || u.TenDangNhap,
        email: u.Email,
        phone: phone,
        status: status,
        isActive: status === 'ACTIVE',
        date: '15/03/2026' // Default registration date fallback
      };
    });

    res.json(mappedUsers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const toggleUserActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.taiKhoan.findUnique({
      where: { IDTaiKhoan: Number(id) }
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const nextStatus = user.TrangThaiTaiKhoan === 'LOCKED' ? 'ACTIVE' : 'LOCKED';

    const updated = await prisma.taiKhoan.update({
      where: { IDTaiKhoan: Number(id) },
      data: { TrangThaiTaiKhoan: nextStatus }
    });

    logActivity(
      'admin@voucher.vn',
      nextStatus === 'LOCKED' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
      updated.HoTenNguoiDung || updated.TenDangNhap,
      req.ip || '127.0.0.1'
    );

    res.json({
      id: updated.IDTaiKhoan,
      name: updated.HoTenNguoiDung || updated.TenDangNhap,
      email: updated.Email,
      status: nextStatus,
      isActive: nextStatus === 'ACTIVE'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Thống kê Dashboard ===
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { range, startDate, endDate } = req.query;

    const now = new Date();
    let start: Date;
    let end: Date;

    if (range === 'today') {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === '7days') {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === '30days') {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'custom' && startDate && endDate) {
      start = new Date(String(startDate));
      start.setHours(0, 0, 0, 0);
      end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);
    } else {
      // Default to last 7 days
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    const orderWhereClause: any = {
      TrangThaiThanhToan: 'PAID',
      ThoiGianThanhToan: {
        gte: start,
        lte: end
      }
    };

    const orderFilterClause: any = {
      ThoiGianThanhToan: {
        gte: start,
        lte: end
      }
    };

    const [
      aggregateRevenue,
      tongDonHang,
      tongKhachHang,
      tongDoiTac,
      tongVoucher,
      aggregateSold,
      tongMaPhatHanh,
      tongMaSuDung
    ] = await Promise.all([
      // 1. Tổng doanh thu (paid orders in timeframe)
      prisma.donHang.aggregate({
        _sum: { TongTien: true },
        where: orderWhereClause
      }),
      // 2. Tổng đơn hàng (in timeframe)
      prisma.donHang.count({
        where: orderFilterClause
      }),
      // 3. Khách hàng (all-time total)
      prisma.khachHang.count(),
      // 4. Đối tác (all-time total)
      prisma.doiTac.count(),
      // 5. Tổng số Voucher (all-time total)
      prisma.voucher.count(),
      // 6. Tổng số lượng voucher đã bán (in timeframe)
      prisma.chiTietDonHang.aggregate({
        _sum: { SoLuongMua: true },
        where: { DonHang: orderWhereClause }
      }),
      // 7. Mã phát hành (MaVoucher - all-time total)
      prisma.maVoucher.count(),
      // 8. Mã đã sử dụng (all-time total)
      prisma.maVoucher.count({
        where: { TrangThaiSuDung: 'Đã sử dụng' }
      })
    ]);

    const tongDoanhThu = Number(aggregateRevenue._sum.TongTien || 0);
    const tongVoucherDaBan = Number(aggregateSold._sum.SoLuongMua || 0);

    // 9. Doanh thu theo ngày trong khoảng thời gian đã chọn
    const recentPaidOrders = await prisma.donHang.findMany({
      where: orderWhereClause,
      select: {
        ThoiGianThanhToan: true,
        TongTien: true
      }
    });

    const revenueMap: { [key: string]: number } = {};

    // Group by date formatted as DD/MM in JS
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueMap[key] = 0;
    }

    recentPaidOrders.forEach(order => {
      if (order.ThoiGianThanhToan) {
        const dateObj = new Date(order.ThoiGianThanhToan);
        const key = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        if (revenueMap[key] !== undefined) {
          revenueMap[key] += Number(order.TongTien || 0);
        }
      }
    });

    const doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({
      date,
      revenue: revenueMap[date]
    }));

    // 10. Top 5 Voucher bán chạy (in timeframe)
    const topVouchersRaw = await prisma.chiTietDonHang.groupBy({
      by: ['VoucherID'],
      _sum: {
        SoLuongMua: true
      },
      where: {
        DonHang: orderWhereClause
      },
      orderBy: {
        _sum: {
          SoLuongMua: 'desc'
        }
      },
      take: 5
    });

    const topVouchers = await Promise.all(
      topVouchersRaw.map(async item => {
        let name = `Voucher #${item.VoucherID}`;
        if (item.VoucherID) {
          const v = await prisma.voucher.findUnique({
            where: { VoucherID: item.VoucherID }
          });
          if (v) {
            name = v.TenVoucher;
          }
        }
        return {
          name,
          sales: Number(item._sum.SoLuongMua || 0)
        };
      })
    );

    // 11. Recent Orders list (in timeframe)
    const recentOrdersRaw = await prisma.donHang.findMany({
      where: orderFilterClause,
      orderBy: {
        MaDonHang: 'desc'
      },
      take: 5,
      include: {
        TaiKhoan: true
      }
    });

    const recentOrders = recentOrdersRaw.map(o => {
      const timeStr = o.ThoiGianThanhToan
        ? new Date(o.ThoiGianThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(o.ThoiGianThanhToan).toLocaleDateString('vi-VN')
        : '';
      return {
        id: `ORD-${o.MaDonHang}`,
        customer: o.TaiKhoan?.HoTenNguoiDung || o.TaiKhoan?.TenDangNhap || 'Khách vãng lai',
        total: Number(o.TongTien || 0).toLocaleString('vi-VN') + 'đ',
        status: o.TrangThaiThanhToan || o.TrangThaiDonHang || 'PENDING',
        time: timeStr
      };
    });

    res.json({
      tongDoanhThu,
      tongDonHang,
      tongKhachHang,
      tongDoiTac,
      tongVoucher,
      tongVoucherDaBan,
      tongMaPhatHanh,
      tongMaSuDung,
      doanhThuTheoNgay,
      topVouchers,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Quản lý nội dung (CRUD) ===
export const getContent = async (req: Request, res: Response) => {
  try {
    const [banners, articles, faqs] = await Promise.all([
      prisma.banner.findMany({ orderBy: { ThuTu: 'asc' } }),
      prisma.baiViet.findMany({ orderBy: { NgayTao: 'desc' } }),
      prisma.fAQ.findMany({ orderBy: { ThuTu: 'asc' } })
    ]);
    res.json({ banners, articles, faqs });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createContent = async (req: Request, res: Response) => {
  try {
    const { type, ...data } = req.body;
    if (type === 'banner') {
      const banner = await prisma.banner.create({
        data: {
          TieuDe: data.TieuDe || '',
          HinhAnh: data.HinhAnh || '',
          LinkURL: data.LinkURL || '',
          ViTri: data.ViTri || 'Homepage Top',
          TrangThai: data.TrangThai || 'Đang hiển thị',
          ThuTu: data.ThuTu !== undefined ? Number(data.ThuTu) : 0
        }
      });
      return res.status(201).json(banner);
    } else if (type === 'article') {
      const article = await prisma.baiViet.create({
        data: {
          TieuDe: data.TieuDe || '',
          NoiDung: data.NoiDung || '',
          TacGia: data.TacGia || 'Admin',
          TrangThai: data.TrangThai || 'Nháp',
          LuotXem: data.LuotXem !== undefined ? Number(data.LuotXem) : 0
        }
      });
      return res.status(201).json(article);
    } else if (type === 'faq') {
      const faq = await prisma.fAQ.create({
        data: {
          CauHoi: data.CauHoi || '',
          TraLoi: data.TraLoi || '',
          DanhMucFAQ: data.DanhMucFAQ || 'Mua hàng',
          ThuTu: data.ThuTu !== undefined ? Number(data.ThuTu) : 0,
          TrangThai: data.TrangThai || 'Hiển thị'
        }
      });
      return res.status(201).json(faq);
    } else {
      return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, ...data } = req.body;

    if (type === 'banner') {
      const { MaBanner, ...updateData } = data;
      if (updateData.ThuTu !== undefined) {
        updateData.ThuTu = Number(updateData.ThuTu);
      }
      const banner = await prisma.banner.update({
        where: { MaBanner: Number(id) },
        data: updateData
      });
      return res.json(banner);
    } else if (type === 'article') {
      const { MaBaiViet, ...updateData } = data;
      if (updateData.LuotXem !== undefined) {
        updateData.LuotXem = Number(updateData.LuotXem);
      }
      const article = await prisma.baiViet.update({
        where: { MaBaiViet: Number(id) },
        data: updateData
      });
      return res.json(article);
    } else if (type === 'faq') {
      const { MaFAQ, ...updateData } = data;
      if (updateData.ThuTu !== undefined) {
        updateData.ThuTu = Number(updateData.ThuTu);
      }
      const faq = await prisma.fAQ.update({
        where: { MaFAQ: Number(id) },
        data: updateData
      });
      return res.json(faq);
    } else {
      return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'banner') {
      await prisma.banner.delete({ where: { MaBanner: Number(id) } });
      return res.json({ message: 'Đã xóa banner' });
    } else if (type === 'article') {
      await prisma.baiViet.delete({ where: { MaBaiViet: Number(id) } });
      return res.json({ message: 'Đã xóa bài viết' });
    } else if (type === 'faq') {
      await prisma.fAQ.delete({ where: { MaFAQ: Number(id) } });
      return res.json({ message: 'Đã xóa FAQ' });
    } else {
      return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Quản lý đối tác ===
export const getPartners = async (req: Request, res: Response) => {
  try {
    const partners = await prisma.doiTac.findMany({
      include: {
        Vouchers: true
      }
    });

    const mapped = partners.map(p => {
      let totalRevenue = 0;
      p.Vouchers.forEach(v => {
        const sales = Number(v.SoLuongDaBan || 0);
        const price = Number(v.GiaBan || 0);
        totalRevenue += sales * price;
      });

      return {
        id: p.MaDoiTac,
        name: p.TenDoanhNghiep || 'Đối tác chưa đặt tên',
        category: p.LinhVucKinhDoanh || 'Khác',
        vouchers: p.Vouchers.length,
        revenue: totalRevenue.toLocaleString('vi-VN') + 'đ',
        status: p.TrangThaiHoatDong || 'ACTIVE',
        date: '01/03/2026',
        taxCode: p.MaSoThue || '',
        representative: p.CaNhanDaiDien || '',
        approvalStatus: p.TrangThaiPheDuyet || 'PENDING'
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createPartner = async (req: Request, res: Response) => {
  try {
    const { name, category, taxCode, representative, status } = req.body;
    const partner = await prisma.doiTac.create({
      data: {
        TenDoanhNghiep: name,
        LinhVucKinhDoanh: category,
        MaSoThue: taxCode || '',
        CaNhanDaiDien: representative || '',
        TrangThaiHoatDong: status || 'ACTIVE',
        TrangThaiPheDuyet: 'APPROVED'
      }
    });

    logActivity('admin@voucher.vn', 'Thêm đối tác', name, req.ip || '127.0.0.1');

    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updatePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, taxCode, representative, status } = req.body;
    const partner = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: {
        TenDoanhNghiep: name,
        LinhVucKinhDoanh: category,
        MaSoThue: taxCode,
        CaNhanDaiDien: representative,
        TrangThaiHoatDong: status
      }
    });

    logActivity('admin@voucher.vn', 'Cập nhật đối tác', name, req.ip || '127.0.0.1');

    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: Number(id) }
    });

    if (!partner) {
      return res.status(404).json({ error: 'Không tìm thấy đối tác' });
    }

    const count = await prisma.voucher.count({
      where: { MaDoiTac: Number(id) }
    });
    if (count > 0) {
      return res.status(400).json({ error: 'Không thể xóa đối tác này vì có voucher liên kết.' });
    }

    await prisma.doiTac.delete({
      where: { MaDoiTac: Number(id) }
    });

    logActivity('admin@voucher.vn', 'Xóa đối tác', partner.TenDoanhNghiep || `ID: ${id}`, req.ip || '127.0.0.1');

    res.json({ message: 'Đã xóa đối tác thành công' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const togglePartnerActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: Number(id) }
    });
    if (!partner) {
      return res.status(404).json({ error: 'Không tìm thấy đối tác' });
    }
    const nextStatus = partner.TrangThaiHoatDong === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
    const updated = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: { TrangThaiHoatDong: nextStatus }
    });
    logActivity(
      'admin@voucher.vn',
      nextStatus === 'LOCKED' ? 'Khóa đối tác' : 'Mở khóa đối tác',
      updated.TenDoanhNghiep || `ID: ${id}`,
      req.ip || '127.0.0.1'
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const approvePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: {
        TrangThaiPheDuyet: 'APPROVED',
        TrangThaiHoatDong: 'ACTIVE'
      }
    });
    logActivity('admin@voucher.vn', 'Phê duyệt đối tác', partner.TenDoanhNghiep || `ID: ${id}`, req.ip || '127.0.0.1');
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const rejectPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: { TrangThaiPheDuyet: 'REJECTED' }
    });
    logActivity('admin@voucher.vn', 'Từ chối đối tác', partner.TenDoanhNghiep || `ID: ${id}`, req.ip || '127.0.0.1');
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Admin Vouchers ===
export const getAdminVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({
      include: { DoiTac: true }
    });

    const mapped = vouchers.map(v => {
      const timeStr = v.ThoiGianBatDau
        ? new Date(v.ThoiGianBatDau).toLocaleDateString('vi-VN')
        : '';

      let statusStr = 'Chờ duyệt';
      if (v.TrangThaiVoucher === 'ACTIVE') {
        statusStr = 'Đã duyệt';
      } else if (v.TrangThaiVoucher === 'REJECTED') {
        statusStr = 'Từ chối';
      }

      return {
        id: v.VoucherID,
        name: v.TenVoucher,
        description: v.MoTaVoucher || '',
        conditions: v.MoTaDieuKien || '',
        partner: v.DoiTac?.TenDoanhNghiep || 'Đối tác ẩn',
        originalPrice: Number(v.GiaGoc).toLocaleString('vi-VN') + 'đ',
        salePrice: Number(v.GiaBan).toLocaleString('vi-VN') + 'đ',
        quantity: v.SoLuongChoPhep,
        date: timeStr,
        status: statusStr,
        startDate: v.ThoiGianBatDau,
        endDate: v.ThoiGianKetThuc
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Quản lý đơn hàng ===
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.donHang.findMany({
      include: {
        TaiKhoan: true,
        ChiTietDonHangs: {
          include: {
            Voucher: true
          }
        }
      },
      orderBy: {
        MaDonHang: 'desc'
      }
    });

    const mapped = orders.map(o => {
      const dateStr = o.ThoiGianThanhToan
        ? new Date(o.ThoiGianThanhToan).toLocaleDateString('vi-VN') + ' ' + new Date(o.ThoiGianThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        : 'Chưa thanh toán';

      let status = 'PENDING';
      if (o.TrangThaiThanhToan === 'PAID') {
        status = 'PAID';
      } else if (o.TrangThaiThanhToan === 'REFUNDED') {
        status = 'REFUNDED';
      } else if (o.TrangThaiDonHang === 'CANCELLED') {
        status = 'CANCELLED';
      }

      const items = o.ChiTietDonHangs.map(item => ({
        voucherId: item.VoucherID,
        name: item.Voucher?.TenVoucher || `Voucher #${item.VoucherID}`,
        quantity: item.SoLuongMua || 0,
        price: Number(item.DonGia || 0).toLocaleString('vi-VN') + 'đ'
      }));

      return {
        id: `ORD-${o.MaDonHang}`,
        rawId: o.MaDonHang,
        customer: o.TaiKhoan?.HoTenNguoiDung || o.TaiKhoan?.TenDangNhap || 'Khách vãng lai',
        customerEmail: o.TaiKhoan?.Email || '',
        customerPhone: o.TaiKhoan?.TenDangNhap || '',
        total: Number(o.TongTien || 0).toLocaleString('vi-VN') + 'đ',
        payment: o.PhuongThucThanhToan || 'MoMo',
        status: status,
        date: dateStr,
        items: items
      };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.donHang.findUnique({
      where: { MaDonHang: Number(id) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    let dataToUpdate: any = {};
    if (status === 'PAID') {
      dataToUpdate = {
        TrangThaiThanhToan: 'PAID',
        TrangThaiDonHang: 'COMPLETED',
        ThoiGianThanhToan: new Date()
      };
    } else if (status === 'CANCELLED') {
      dataToUpdate = {
        TrangThaiDonHang: 'CANCELLED'
      };
    } else if (status === 'REFUNDED') {
      dataToUpdate = {
        TrangThaiThanhToan: 'REFUNDED',
        TrangThaiDonHang: 'CANCELLED'
      };
    } else {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const updated = await prisma.donHang.update({
      where: { MaDonHang: Number(id) },
      data: dataToUpdate
    });

    logActivity('admin@voucher.vn', `Cập nhật đơn hàng ORD-${id}`, `Trạng thái: ${status}`, req.ip || '127.0.0.1');

    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công', order: updated });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === System Logs ===
export const getLogs = async (req: Request, res: Response) => {
  try {
    let logs = [];
    if (fs.existsSync(LOG_FILE_PATH)) {
      const data = fs.readFileSync(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(data || '[]');
    } else {
      logs = [
        { id: 1, user: 'admin@voucher.vn', action: 'Phê duyệt voucher', target: 'Highlands Coffee - Giảm 50K', ip: '127.0.0.1', time: new Date().toLocaleString('vi-VN'), status: 'Thành công' },
        { id: 2, user: 'admin@voucher.vn', action: 'Kích hoạt hệ thống', target: 'Dashboard', ip: '127.0.0.1', time: new Date().toLocaleString('vi-VN'), status: 'Thành công' }
      ];
      fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
    }
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Admin Profile ===
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.findFirst({
      include: { TaiKhoan: true }
    });
    if (!admin) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ admin' });
    }
    res.json({
      username: admin.TaiKhoan?.TenDangNhap || 'admin01',
      fullName: admin.TaiKhoan?.HoTenNguoiDung || 'System Administrator',
      email: admin.TaiKhoan?.Email || 'admin@voucher.vn',
      phone: admin.SDT_Admin || '0911111111',
      role: 'System Admin'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone } = req.body;
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ admin' });
    }

    if (admin.IDTaiKhoan) {
      await prisma.taiKhoan.update({
        where: { IDTaiKhoan: admin.IDTaiKhoan },
        data: {
          HoTenNguoiDung: fullName,
          Email: email
        }
      });
    }

    if (phone && phone !== admin.SDT_Admin) {
      await prisma.$executeRaw`UPDATE Admin SET SDT_Admin = ${phone} WHERE SDT_Admin = ${admin.SDT_Admin}`;
    }

    logActivity('admin@voucher.vn', 'Cập nhật hồ sơ admin', fullName, req.ip || '127.0.0.1');

    res.json({ message: 'Cập nhật hồ sơ thành công' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateAdminPassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.admin.findFirst({
      include: { TaiKhoan: true }
    });
    if (!admin || !admin.TaiKhoan) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ admin' });
    }

    if (admin.IDTaiKhoan) {
      await prisma.taiKhoan.update({
        where: { IDTaiKhoan: admin.IDTaiKhoan },
        data: {
          MatKhau: newPassword
        }
      });
    }

    logActivity('admin@voucher.vn', 'Đổi mật khẩu admin', admin.TaiKhoan.TenDangNhap, req.ip || '127.0.0.1');

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Admin Notifications ===
export const getAdminNotifications = async (req: Request, res: Response) => {
  try {
    const [pendingPartners, pendingVouchers, paidOrders] = await Promise.all([
      // 1. Pending partners
      prisma.doiTac.findMany({
        where: { TrangThaiPheDuyet: 'PENDING' },
        orderBy: { MaDoiTac: 'desc' },
        take: 5
      }),
      // 2. Pending vouchers
      prisma.voucher.findMany({
        where: { TrangThaiVoucher: 'PENDING_APPROVAL' },
        orderBy: { VoucherID: 'desc' },
        take: 5
      }),
      // 3. Paid orders
      prisma.donHang.findMany({
        where: { TrangThaiThanhToan: 'PAID' },
        orderBy: { ThoiGianThanhToan: 'desc' },
        take: 5
      })
    ]);

    const notifications: any[] = [];

    // Map partners
    pendingPartners.forEach(p => {
      notifications.push({
        id: `partner-${p.MaDoiTac}`,
        type: 'alert',
        titleVi: 'Yêu cầu duyệt đối tác mới',
        titleEn: 'New Partner Registration',
        messageVi: `Đối tác "${p.TenDoanhNghiep || 'Chưa rõ'}" đang chờ phê duyệt hồ sơ.`,
        messageEn: `Partner "${p.TenDoanhNghiep || 'Unknown'}" is pending registration approval.`,
        time: 'Gần đây'
      });
    });

    // Map vouchers
    pendingVouchers.forEach(v => {
      notifications.push({
        id: `voucher-${v.VoucherID}`,
        type: 'info',
        titleVi: 'Yêu cầu duyệt Voucher',
        titleEn: 'New Voucher Approval Request',
        messageVi: `Voucher "${v.TenVoucher}" đang chờ duyệt.`,
        messageEn: `Voucher "${v.TenVoucher}" is pending approval.`,
        time: 'Gần đây'
      });
    });

    // Map orders
    paidOrders.forEach(o => {
      notifications.push({
        id: `order-${o.MaDonHang}`,
        type: 'order',
        titleVi: 'Có đơn hàng mới',
        titleEn: 'New Order Received',
        messageVi: `Đơn hàng ORD-${o.MaDonHang} vừa được thanh toán thành công.`,
        messageEn: `Order ORD-${o.MaDonHang} has been successfully paid.`,
        time: 'Gần đây'
      });
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
