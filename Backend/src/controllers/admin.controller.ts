import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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
        Admin: true,
        NhanVienDoiTacs: { include: { DoiTac: true } }
      }
    });

    const mapped = accounts.map(u => {
      const phone = u.KhachHang?.SDT_KH || u.Admin?.SDT_Admin || '';

      // Chuẩn hóa: chỉ nhận ACTIVE | INACTIVE | PENDING
      const dbStatus = (u.TrangThaiTaiKhoan || '').trim().toUpperCase();
      let status: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
      if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') status = 'INACTIVE';
      else if (dbStatus === 'PENDING' || dbStatus === 'CHỜ DUYỆT') status = 'PENDING';

      // Loại tài khoản
      let accountType: 'Admin' | 'Partner' | 'Customer' = 'Customer';
      if (u.Admin) accountType = 'Admin';
      else if (u.NhanVienDoiTacs?.length > 0) accountType = 'Partner';

      const partnerStatus = u.NhanVienDoiTacs?.[0]?.DoiTac?.TrangThaiPheDuyet || null;

      // Nếu là Partner, trạng thái tài khoản phải phản ánh trạng thái của Đối tác
      if (accountType === 'Partner' && u.NhanVienDoiTacs?.[0]?.DoiTac) {
        const pt = u.NhanVienDoiTacs[0].DoiTac;
        if (pt.TrangThaiPheDuyet === 'PENDING') {
          status = 'PENDING';
        } else if (pt.TrangThaiPheDuyet === 'REJECTED' || pt.TrangThaiHoatDong === 'LOCKED') {
          status = 'INACTIVE';
        } else if (pt.TrangThaiPheDuyet === 'APPROVED' && pt.TrangThaiHoatDong === 'ACTIVE') {
          if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') {
            status = 'INACTIVE';
          } else {
            status = 'ACTIVE';
          }
        }
      }

      return { id: u.IDTaiKhoan, name: u.HoTenNguoiDung || u.TenDangNhap, email: u.Email, phone, status, accountType, partnerStatus, date: '15/03/2026' };
    });

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const toggleUserActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.taiKhoan.findUnique({
      where: { IDTaiKhoan: Number(id) },
      include: { NhanVienDoiTacs: { include: { DoiTac: true } } }
    });
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

    // Chặn khóa partner đang PENDING
    if (user.NhanVienDoiTacs?.length > 0) {
      const pStatus = user.NhanVienDoiTacs[0]?.DoiTac?.TrangThaiPheDuyet;
      if (pStatus === 'PENDING') {
        return res.status(400).json({ error: 'Không thể khóa tài khoản Đối tác đang ở trạng thái Chờ duyệt (PENDING).' });
      }
    }

    // Tính trạng thái derived hiện tại để toggle
    const dbStatus = (user.TrangThaiTaiKhoan || '').trim().toUpperCase();
    let derivedStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' = 'ACTIVE';
    if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') derivedStatus = 'INACTIVE';
    else if (dbStatus === 'PENDING' || dbStatus === 'CHỜ DUYỆT') derivedStatus = 'PENDING';

    if (user.NhanVienDoiTacs?.length > 0 && user.NhanVienDoiTacs[0]?.DoiTac) {
      const pt = user.NhanVienDoiTacs[0].DoiTac;
      if (pt.TrangThaiPheDuyet === 'PENDING') {
        derivedStatus = 'PENDING';
      } else if (pt.TrangThaiPheDuyet === 'REJECTED' || pt.TrangThaiHoatDong === 'LOCKED') {
        derivedStatus = 'INACTIVE';
      } else if (pt.TrangThaiPheDuyet === 'APPROVED' && pt.TrangThaiHoatDong === 'ACTIVE') {
        if (dbStatus === 'LOCKED' || dbStatus === 'INACTIVE' || dbStatus === 'BỊ KHÓA') {
          derivedStatus = 'INACTIVE';
        } else {
          derivedStatus = 'ACTIVE';
        }
      }
    }

    if (derivedStatus === 'PENDING') {
      return res.status(400).json({ error: 'Không thể khóa tài khoản đang ở trạng thái Chờ duyệt (PENDING).' });
    }

    const nextDbStatus = derivedStatus === 'ACTIVE' ? 'Bị khóa' : 'Hoạt động';
    const updated = await prisma.taiKhoan.update({ where: { IDTaiKhoan: Number(id) }, data: { TrangThaiTaiKhoan: nextDbStatus } });
    logActivity('admin@voucher.vn', nextDbStatus === 'Bị khóa' ? 'Lock account' : 'Unlock account', updated.HoTenNguoiDung || updated.TenDangNhap, req.ip || '127.0.0.1');
    res.json({ id: updated.IDTaiKhoan, status: derivedStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
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
      // 7. Ma phat hanh trong khoang thoi gian dang chon
      prisma.maVoucher.count({
        where: {
          ThoiDiemPhatHanh: {
            gte: start,
            lte: end
          }
        }
      }),
      // 8. Ma da su dung trong khoang thoi gian dang chon
      prisma.maVoucher.count({
        where: {
          TrangThaiSuDung: 'Đã sử dụng',
          ThoiDiemSuDung: {
            gte: start,
            lte: end
          }
        }
      })
    ]);

    const tongDoanhThu = Number(aggregateRevenue._sum.TongTien || 0);
    const tongVoucherDaBan = Number(aggregateSold._sum.SoLuongMua || 0);

    // 9b. Tính kỳ trước để so sánh % tăng trưởng
    const periodLength = end.getTime() - start.getTime() + 1;
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(start.getTime() - periodLength);

    const prevOrderWhereClause: any = {
      TrangThaiThanhToan: 'PAID',
      ThoiGianThanhToan: { gte: prevStart, lte: prevEnd }
    };
    const prevOrderFilterClause: any = {
      ThoiGianThanhToan: { gte: prevStart, lte: prevEnd }
    };

    const [prevRevAggregate, prevDonHang, prevSoldAggregate, prevIssuedCodes, prevUsedCodes] = await Promise.all([
      prisma.donHang.aggregate({ _sum: { TongTien: true }, where: prevOrderWhereClause }),
      prisma.donHang.count({ where: prevOrderFilterClause }),
      prisma.chiTietDonHang.aggregate({ _sum: { SoLuongMua: true }, where: { DonHang: prevOrderWhereClause } }),
      prisma.maVoucher.count({
        where: {
          ThoiDiemPhatHanh: {
            gte: prevStart,
            lte: prevEnd
          }
        }
      }),
      prisma.maVoucher.count({
        where: {
          TrangThaiSuDung: 'Đã sử dụng',
          ThoiDiemSuDung: {
            gte: prevStart,
            lte: prevEnd
          }
        }
      }),
    ]);

    const prevDoanhThu = Number(prevRevAggregate._sum.TongTien || 0);
    const prevDonHangCount = prevDonHang;
    const prevVoucherDaBan = Number(prevSoldAggregate._sum.SoLuongMua || 0);

    // 9. Doanh thu theo ngày trong khoảng thời gian đã chọn
    const recentPaidOrders = await prisma.donHang.findMany({
      where: orderWhereClause,
      select: {
        ThoiGianThanhToan: true,
        TongTien: true
      }
    });

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let doanhThuTheoNgay: { date: string; revenue: number }[] = [];
    let revenueGranularity: 'day' | 'week' | 'month' = 'day';

    if (diffDays <= 31) {
      revenueGranularity = 'day';
      // Hàng ngày
      const revenueMap: { [key: string]: number } = {};
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
      doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    } else if (diffDays <= 180) {
      revenueGranularity = 'week';
      // Hàng tuần
      const revenueMap: { [key: string]: number } = {};
      
      const getWeekKey = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d.setDate(diff));
        return `Tuần ${String(weekStart.getDate()).padStart(2, '0')}/${String(weekStart.getMonth() + 1).padStart(2, '0')}`;
      };

      let current = new Date(start);
      while (current <= end) {
        const key = getWeekKey(current);
        revenueMap[key] = 0;
        current.setDate(current.getDate() + 7);
      }
      const endKey = getWeekKey(end);
      revenueMap[endKey] = 0;

      recentPaidOrders.forEach(order => {
        if (order.ThoiGianThanhToan) {
          const key = getWeekKey(new Date(order.ThoiGianThanhToan));
          if (revenueMap[key] !== undefined) {
            revenueMap[key] += Number(order.TongTien || 0);
          }
        }
      });
      doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    } else {
      revenueGranularity = 'month';
      // Hàng tháng
      const revenueMap: { [key: string]: number } = {};
      
      const getMonthKey = (date: Date) => {
        return `Tháng ${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      };

      let current = new Date(start);
      while (current <= end) {
        const key = getMonthKey(current);
        revenueMap[key] = 0;
        current.setMonth(current.getMonth() + 1);
      }
      const endKey = getMonthKey(end);
      revenueMap[endKey] = 0;

      recentPaidOrders.forEach(order => {
        if (order.ThoiGianThanhToan) {
          const key = getMonthKey(new Date(order.ThoiGianThanhToan));
          if (revenueMap[key] !== undefined) {
            revenueMap[key] += Number(order.TongTien || 0);
          }
        }
      });
      doanhThuTheoNgay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));
    }

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
      prevDoanhThu,
      prevDonHang: prevDonHangCount,
      prevVoucherDaBan,
      prevKhachHang: null,
      prevDoiTac: null,
      prevVoucher: null,
      prevMaPhatHanh: prevIssuedCodes,
      prevMaSuDung: prevUsedCodes,
      revenueGranularity,
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
      if (!String(data.TieuDe || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề banner' });
      }
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
      if (!String(data.TieuDe || '').trim() || !String(data.NoiDung || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề và nội dung bài viết' });
      }
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
      if (!String(data.CauHoi || '').trim() || !String(data.TraLoi || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi và câu trả lời' });
      }
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
      if (updateData.TieuDe !== undefined && !String(updateData.TieuDe).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề banner' });
      }
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
      if (updateData.TieuDe !== undefined && !String(updateData.TieuDe).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề bài viết' });
      }
      if (updateData.NoiDung !== undefined && !String(updateData.NoiDung).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung bài viết' });
      }
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
      if (updateData.CauHoi !== undefined && !String(updateData.CauHoi).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
      }
      if (updateData.TraLoi !== undefined && !String(updateData.TraLoi).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu trả lời' });
      }
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

    const deleteImageFile = (imagePath: string | null | undefined) => {
      if (!imagePath || imagePath.startsWith('http')) return; // bỏ qua URL ngoài
      try {
        const filePath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) { console.error('Delete image error:', e); }
    };

    if (type === 'banner') {
      const rec = await prisma.banner.findUnique({ where: { MaBanner: Number(id) } });
      deleteImageFile(rec?.HinhAnh);
      await prisma.banner.delete({ where: { MaBanner: Number(id) } });
      return res.json({ message: 'Đã xóa banner' });
    } else if (type === 'article') {
      const rec = await prisma.baiViet.findUnique({ where: { MaBaiViet: Number(id) } });
      deleteImageFile((rec as any)?.HinhAnh);
      await prisma.baiViet.delete({ where: { MaBaiViet: Number(id) } });
      return res.json({ message: 'Đã xóa bài viết' });
    } else if (type === 'faq') {
      await prisma.fAQ.delete({ where: { MaFAQ: Number(id) } });
      return res.json({ message: 'Đã xóa FAQ' });
    }
    return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
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

    // Đồng bộ trạng thái tài khoản của nhân viên đối tác
    const employees = await prisma.nhanVienDoiTac.findMany({
      where: { MaDoiTac: Number(id) },
      select: { IDTaiKhoan: true }
    });
    const accountIds = employees.map(e => e.IDTaiKhoan).filter((val): val is number => val !== null);
    if (accountIds.length > 0) {
      await prisma.taiKhoan.updateMany({
        where: { IDTaiKhoan: { in: accountIds } },
        data: { TrangThaiTaiKhoan: nextStatus === 'LOCKED' ? 'Bị khóa' : 'Hoạt động' }
      });
    }

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

    // Đồng bộ trạng thái tài khoản của nhân viên đối tác
    const employees = await prisma.nhanVienDoiTac.findMany({
      where: { MaDoiTac: Number(id) },
      select: { IDTaiKhoan: true }
    });
    const accountIds = employees.map(e => e.IDTaiKhoan).filter((val): val is number => val !== null);
    if (accountIds.length > 0) {
      await prisma.taiKhoan.updateMany({
        where: { IDTaiKhoan: { in: accountIds } },
        data: { TrangThaiTaiKhoan: 'Hoạt động' }
      });
    }

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

    // Đồng bộ trạng thái tài khoản của nhân viên đối tác
    const employees = await prisma.nhanVienDoiTac.findMany({
      where: { MaDoiTac: Number(id) },
      select: { IDTaiKhoan: true }
    });
    const accountIds = employees.map(e => e.IDTaiKhoan).filter((val): val is number => val !== null);
    if (accountIds.length > 0) {
      await prisma.taiKhoan.updateMany({
        where: { IDTaiKhoan: { in: accountIds } },
        data: { TrangThaiTaiKhoan: 'Bị khóa' }
      });
    }

    logActivity('admin@voucher.vn', 'Từ chối đối tác', partner.TenDoanhNghiep || `ID: ${id}`, req.ip || '127.0.0.1');
    res.json(partner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Admin Vouchers ===
export const getAdminVouchers = async (req: Request, res: Response) => {
  try {
    const vouchers = await prisma.voucher.findMany({ include: { DoiTac: true }, orderBy: { VoucherID: 'desc' } });
    const mapped = vouchers.map(v => ({
      id: v.VoucherID,
      name: v.TenVoucher,
      partner: v.DoiTac?.TenDoanhNghiep || 'Đối tác ẩn',
      originalPrice: Number(v.GiaGoc).toLocaleString('vi-VN') + 'đ',
      salePrice: Number(v.GiaBan).toLocaleString('vi-VN') + 'đ',
      quantitySold: v.SoLuongDaBan || 0,
      quantityTotal: v.SoLuongChoPhep,
      date: v.ThoiGianBatDau ? new Date(v.ThoiGianBatDau).toLocaleDateString('vi-VN') : '',
      status: v.TrangThaiVoucher             // raw: PENDING_APPROVAL | ACTIVE | REJECTED | SUSPENDED
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Quản lý đơn hàng ===
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where: any = {};
    if (startDate && endDate) {
      where.ThoiGianThanhToan = { gte: new Date(String(startDate) + 'T00:00:00'), lte: new Date(String(endDate) + 'T23:59:59') };
    }
    if (status === 'PAID') where.TrangThaiThanhToan = 'PAID';
    else if (status === 'REFUNDED') where.TrangThaiThanhToan = 'REFUNDED';
    else if (status === 'CANCELLED') where.TrangThaiDonHang = 'CANCELLED';
    else if (status === 'PENDING') where.TrangThaiThanhToan = { notIn: ['PAID', 'REFUNDED'] };

    const orders = await prisma.donHang.findMany({
      where,
      include: { TaiKhoan: true, ChiTietDonHangs: { include: { Voucher: true } } },
      orderBy: { MaDonHang: 'desc' }
    });

    const mapped = orders.map(o => {
      const dateStr = o.ThoiGianThanhToan ? new Date(o.ThoiGianThanhToan).toLocaleDateString('vi-VN') + ' ' + new Date(o.ThoiGianThanhToan).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Chưa thanh toán';
      let orderStatus = 'PENDING';
      if (o.TrangThaiThanhToan === 'PAID') orderStatus = 'PAID';
      else if (o.TrangThaiThanhToan === 'REFUNDED') orderStatus = 'REFUNDED';
      else if (o.TrangThaiDonHang === 'CANCELLED') orderStatus = 'CANCELLED';

      // Fix giá 0đ: fallback sang GiaBan của Voucher nếu DonGia null
      const items = o.ChiTietDonHangs.map(item => ({
        voucherId: item.VoucherID,
        name: item.Voucher?.TenVoucher || `Voucher #${item.VoucherID}`,
        quantity: item.SoLuongMua || 1,
        price: Number(item.DonGia ?? item.Voucher?.GiaBan ?? 0).toLocaleString('vi-VN') + 'đ'
      }));

      return { id: `ORD-${o.MaDonHang}`, rawId: o.MaDonHang, customer: o.TaiKhoan?.HoTenNguoiDung || o.TaiKhoan?.TenDangNhap || 'Khách vãng lai', customerEmail: o.TaiKhoan?.Email || '', total: Number(o.TongTien || 0).toLocaleString('vi-VN') + 'đ', payment: o.PhuongThucThanhToan || '', status: orderStatus, date: dateStr, items };
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
      where: { MaDonHang: Number(id) },
      include: { ChiTietDonHangs: { include: { MaVouchers: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    if (status === 'REFUNDED') {
      // Chặn hoàn tiền nếu có mã voucher đã dùng
      const allCodes = order.ChiTietDonHangs.flatMap(ct => ct.MaVouchers);
      const hasUsed = allCodes.some(mv => mv.TrangThaiSuDung === 'Đã sử dụng');
      if (hasUsed) return res.status(400).json({ error: 'Không thể hoàn tiền: có mã voucher đã được sử dụng trong đơn hàng này.' });

      // Hủy toàn bộ mã voucher
      await prisma.maVoucher.updateMany({
        where: { SoMaVoucher: { in: allCodes.map(mv => mv.SoMaVoucher) } },
        data: { TrangThaiSuDung: 'Hủy voucher' }
      });
      await prisma.donHang.update({ where: { MaDonHang: Number(id) }, data: { TrangThaiThanhToan: 'REFUNDED', TrangThaiDonHang: 'CANCELLED' } });
      logActivity('admin@voucher.vn', `Refund ORD-${id}`, `${allCodes.length} voucher codes → Hủy voucher`, req.ip || '127.0.0.1');
      return res.json({ message: 'Hoàn tiền thành công, các mã voucher đã được hủy.' });
    }

    let data: any = {};
    if (status === 'PAID') data = { TrangThaiThanhToan: 'PAID', TrangThaiDonHang: 'COMPLETED', ThoiGianThanhToan: new Date() };
    else if (status === 'CANCELLED') data = { TrangThaiDonHang: 'CANCELLED' };
    else return res.status(400).json({ error: 'Trạng thái không hợp lệ' });

    const updated = await prisma.donHang.update({ where: { MaDonHang: Number(id) }, data });
    logActivity('admin@voucher.vn', `Update ORD-${id}`, `Status: ${status}`, req.ip || '127.0.0.1');
    res.json({ message: 'Cập nhật thành công', order: updated });
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
      const isMatch = await bcrypt.compare(currentPassword, admin.TaiKhoan.MatKhau);
      if (!isMatch) {
        return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.taiKhoan.update({
        where: { IDTaiKhoan: admin.IDTaiKhoan },
        data: {
          MatKhau: hashedPassword
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

// ── [4] suspendVoucher — HÀM MỚI, thêm vào cuối file ──────────────
export const suspendVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lyDo } = req.body;
    if (!lyDo?.trim()) return res.status(400).json({ error: 'Vui lòng nhập lý do tạm ngưng' });

    const voucher = await prisma.voucher.findUnique({ where: { VoucherID: Number(id) } });
    if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    if (voucher.TrangThaiVoucher !== 'ACTIVE') return res.status(400).json({ error: 'Chỉ tạm ngưng được voucher đang ACTIVE' });

    const updated = await prisma.voucher.update({ where: { VoucherID: Number(id) }, data: { TrangThaiVoucher: 'SUSPENDED' } });
    logActivity('admin@voucher.vn', `Suspend voucher (${lyDo})`, updated.TenVoucher, req.ip || '127.0.0.1');
    res.json({ ...updated, status: 'SUSPENDED' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const restoreVoucher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({ where: { VoucherID: Number(id) } });
    if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher' });
    if (voucher.TrangThaiVoucher !== 'SUSPENDED') return res.status(400).json({ error: 'Chỉ khôi phục được voucher đang bị tạm ngưng' });

    const updated = await prisma.voucher.update({ where: { VoucherID: Number(id) }, data: { TrangThaiVoucher: 'ACTIVE' } });
    logActivity('admin@voucher.vn', 'Khôi phục voucher', updated.TenVoucher, req.ip || '127.0.0.1');
    res.json({ ...updated, status: 'ACTIVE' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPartnerBranchStats = async (req: Request, res: Response) => {
  try {
    const { partnerId } = req.params;
    const pId = Number(partnerId);

    const partner = await prisma.doiTac.findUnique({ where: { MaDoiTac: pId } });
    if (!partner) return res.status(404).json({ error: 'Không tìm thấy đối tác' });

    // Lấy danh sách chi nhánh
    const branches = await prisma.chiNhanh.findMany({ where: { MaDoiTac: pId } });

    // Lấy tất cả voucher của đối tác này
    const vouchers = await prisma.voucher.findMany({
      where: { MaDoiTac: pId },
      include: { DanhMuc: true, ChiNhanhs: true }
    });

    // Lấy tất cả mã voucher đã bán (có mã voucher trong đơn hàng) của đối tác này
    const allSoldCodes = await prisma.maVoucher.findMany({
      where: {
        ChiTietDonHang: {
          Voucher: {
            MaDoiTac: pId
          }
        }
      },
      include: {
        ChiTietDonHang: {
          include: {
            Voucher: true
          }
        }
      }
    });

    // Khởi tạo đối tượng thống kê cho từng chi nhánh
    const statsMap: Record<number, {
      branchId: number;
      branchName: string;
      address: string;
      phone: string;
      vouchers: Record<number, {
        voucherId: number;
        name: string;
        category: string;
        limitCount: number;
        soldCount: number;
        usedCount: number;
        salePrice: number;
      }>;
    }> = {};

    branches.forEach(b => {
      statsMap[b.MaChiNhanh] = {
        branchId: b.MaChiNhanh,
        branchName: b.TenChiNhanh || 'Chi nhánh không tên',
        address: b.DiaChiChiNhanh || 'Chưa cập nhật',
        phone: b.SDT_CN || 'Chưa cập nhật',
        vouchers: {}
      };
    });

    // Khởi tạo danh sách voucher có mặt ở từng chi nhánh
    vouchers.forEach(v => {
      const voucherBranches = v.ChiNhanhs || [];
      // Nếu không giới hạn chi nhánh nào thì áp dụng cho tất cả chi nhánh của đối tác
      const targetBranches = voucherBranches.length > 0
        ? branches.filter(b => voucherBranches.some(vb => vb.MaChiNhanh === b.MaChiNhanh))
        : branches;

      targetBranches.forEach(b => {
        const branchStats = statsMap[b.MaChiNhanh];
        if (branchStats) {
          branchStats.vouchers[v.VoucherID] = {
            voucherId: v.VoucherID,
            name: v.TenVoucher,
            category: v.DanhMuc?.TenDanhMuc || 'Khác',
            limitCount: v.SoLuongChoPhep,
            soldCount: 0,
            usedCount: 0,
            salePrice: Number(v.GiaBan)
          };
        }
      });
    });

    // Phân bổ mã voucher đã bán/sử dụng vào các chi nhánh một cách nhất quán (deterministic)
    allSoldCodes.forEach(code => {
      const voucher = code.ChiTietDonHang?.Voucher;
      if (!voucher) return;

      const voucherBranches = vouchers.find(v => v.VoucherID === voucher.VoucherID)?.ChiNhanhs || [];
      const targetBranches = voucherBranches.length > 0
        ? branches.filter(b => voucherBranches.some(vb => vb.MaChiNhanh === b.MaChiNhanh))
        : branches;

      if (targetBranches.length === 0) return;

      // Tính toán mã băm dựa trên chuỗi SoMaVoucher để chọn chi nhánh một cách nhất quán
      let hash = 0;
      const codeStr = code.SoMaVoucher;
      for (let i = 0; i < codeStr.length; i++) {
        hash += codeStr.charCodeAt(i);
      }
      const branchIndex = hash % targetBranches.length;
      const assignedBranchId = targetBranches[branchIndex].MaChiNhanh;

      if (!assignedBranchId || !statsMap[assignedBranchId]) return;

      const branchStats = statsMap[assignedBranchId];
      if (!branchStats.vouchers[voucher.VoucherID]) {
        // Dự phòng trường hợp voucher chưa được thêm ở bước trước
        const mainVoucher = vouchers.find(v => v.VoucherID === voucher.VoucherID);
        branchStats.vouchers[voucher.VoucherID] = {
          voucherId: voucher.VoucherID,
          name: voucher.TenVoucher,
          category: mainVoucher?.DanhMuc?.TenDanhMuc || 'Khác',
          limitCount: voucher.SoLuongChoPhep,
          soldCount: 0,
          usedCount: 0,
          salePrice: Number(voucher.GiaBan)
        };
      }

      branchStats.vouchers[voucher.VoucherID].soldCount++;
      if (code.TrangThaiSuDung === 'Đã sử dụng') {
        branchStats.vouchers[voucher.VoucherID].usedCount++;
      }
    });

    // Format kết quả dạng danh sách
    const result = Object.values(statsMap).map(b => {
      const vouchersList = Object.values(b.vouchers);
      const totalVouchersCount = vouchersList.length;
      const totalSold = vouchersList.reduce((acc, v) => acc + v.soldCount, 0);
      const totalUsed = vouchersList.reduce((acc, v) => acc + v.usedCount, 0);
      const totalRevenue = vouchersList.reduce((acc, v) => acc + (v.usedCount * v.salePrice), 0);

      return {
        branchId: b.branchId,
        branchName: b.branchName,
        address: b.address,
        phone: b.phone,
        vouchers: vouchersList,
        totalVouchersCount,
        totalSold,
        totalUsed,
        totalRevenue
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export { approveVoucher, rejectVoucher } from './voucher.controller';



