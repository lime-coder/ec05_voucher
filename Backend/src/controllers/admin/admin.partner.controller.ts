import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity } from './index';
import { ACCOUNT_STATUS, VOUCHER_USAGE_STATUS } from '../../constants';

export const getPartners = async (req: Request, res: Response, next: NextFunction) => {
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
        status: p.TrangThai === ACCOUNT_STATUS.ACTIVE ? 'ACTIVE' : (p.TrangThai === ACCOUNT_STATUS.LOCKED ? 'LOCKED' : 'PENDING'),
        date: p.NgayThamGia ? new Date(p.NgayThamGia).toLocaleDateString('vi-VN') : '01/03/2026',
        taxCode: p.MaSoThue || '',
        representative: p.CaNhanDaiDien || '',
        phone: p.SDTLienHe || '',
        email: p.EmailLienHe || '',
        description: p.MoTa || '',
        openTime: p.GioMoCua || '',
        closeTime: p.GioDongCua || '',
        approvalStatus: p.TrangThai === ACCOUNT_STATUS.ACTIVE ? 'APPROVED' : (p.TrangThai === ACCOUNT_STATUS.REJECTED ? 'REJECTED' : 'PENDING')
      };
    });

    res.json(mapped);
  } catch (error) {
    next(error);
  }
};

export const createPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, category, taxCode, representative, status } = req.body;
    const partner = await prisma.doiTac.create({
      data: {
        TenDoanhNghiep: name,
        LinhVucKinhDoanh: category,
        MaSoThue: taxCode || '',
        CaNhanDaiDien: representative || '',
        TrangThai: status === 'LOCKED' ? ACCOUNT_STATUS.LOCKED : ACCOUNT_STATUS.ACTIVE
      }
    });

    logActivity(req, 'Thêm đối tác', name);

    res.status(201).json(partner);
  } catch (error) {
    next(error);
  }
};

export const updatePartner = async (req: Request, res: Response, next: NextFunction) => {
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
        TrangThai: status === 'ACTIVE' ? ACCOUNT_STATUS.ACTIVE : (status === 'LOCKED' ? ACCOUNT_STATUS.LOCKED : status === 'REJECTED' ? ACCOUNT_STATUS.REJECTED : ACCOUNT_STATUS.PENDING)
      }
    });

    logActivity(req, 'Cập nhật đối tác', name);

    res.json(partner);
  } catch (error) {
    next(error);
  }
};

export const deletePartner = async (req: Request, res: Response, next: NextFunction) => {
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

    logActivity(req, 'Xóa đối tác', partner.TenDoanhNghiep || `ID: ${id}`);

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const togglePartnerActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const partner = await prisma.doiTac.findUnique({
      where: { MaDoiTac: Number(id) }
    });
    if (!partner) {
      return res.status(404).json({ error: 'Không tìm thấy đối tác' });
    }
    const nextStatus = partner.TrangThai === ACCOUNT_STATUS.LOCKED ? ACCOUNT_STATUS.ACTIVE : ACCOUNT_STATUS.LOCKED;
    const updated = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: { TrangThai: nextStatus }
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
        data: { TrangThaiTaiKhoan: nextStatus }
      });
    }

    logActivity(req, nextStatus === 'Bị khóa' ? 'Khóa đối tác' : 'Mở khóa đối tác', updated.TenDoanhNghiep || `ID: ${id}`);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const approvePartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const partner = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: {
        TrangThai: ACCOUNT_STATUS.ACTIVE
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
        data: { TrangThaiTaiKhoan: ACCOUNT_STATUS.ACTIVE }
      });
    }

    logActivity(req, 'Phê duyệt đối tác', partner.TenDoanhNghiep || `ID: ${id}`);
    res.json(partner);
  } catch (error) {
    next(error);
  }
};

export const rejectPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const partner = await prisma.doiTac.update({
      where: { MaDoiTac: Number(id) },
      data: { TrangThai: ACCOUNT_STATUS.REJECTED }
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
        data: { TrangThaiTaiKhoan: ACCOUNT_STATUS.LOCKED }
      });
    }

    logActivity(req, 'Từ chối đối tác', partner.TenDoanhNghiep || `ID: ${id}`);
    res.json(partner);
  } catch (error) {
    next(error);
  }
};

export const getPartnerBranchStats = async (req: Request, res: Response, next: NextFunction) => {
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
      if (code.TrangThaiSuDung === VOUCHER_USAGE_STATUS.USED) {
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
    next(error);
  }
};
