import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LogService } from './log.service';
import { AnomalyService } from './anomaly.service';
import { AUDIT_ACTIONS, LOG_STATUS } from '../config/audit.config';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_voucherhub_change_in_production';
const JWT_EXPIRES_IN = '30m';

export class AuthService {
  /**
   * Determine user role by checking related tables.
   */
  private static _determineRole(user: any): 'admin' | 'partner' | 'customer' {
    if (user.Admin) return 'admin';
    if (user.NhanVienDoiTacs && user.NhanVienDoiTacs.length > 0) return 'partner';
    return 'customer';
  }

  /**
   * Shared account creation + JWT signing logic.
   */
  private static async _createAccountAndSign(data: any, role: 'admin' | 'partner' | 'customer') {
    const hashedPassword = await bcrypt.hash(data.MatKhau, 10);
    const newTaiKhoan = await prisma.taiKhoan.create({
      data: {
        TenDangNhap: data.TenDangNhap,
        MatKhau: hashedPassword,
        Email: data.Email,
        HoTenNguoiDung: data.HoTenNguoiDung,
      },
    });

    const token = jwt.sign(
      {
        IDTaiKhoan: newTaiKhoan.IDTaiKhoan,
        TenDangNhap: newTaiKhoan.TenDangNhap,
        Email: newTaiKhoan.Email,
        HoTenNguoiDung: newTaiKhoan.HoTenNguoiDung,
        role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, user: { ...newTaiKhoan, role } };
  }

  // ── Registration ────────────────────────────────────────────────

  static async registerCustomer(data: any, ip?: string) {
    const { token, user } = await this._createAccountAndSign(data, 'customer');

    await prisma.khachHang.create({
      data: {
        SDT_KH: data.SDT,
        IDTaiKhoan: user.IDTaiKhoan,
        NgaySinh: data.NgaySinh ? new Date(data.NgaySinh) : undefined,
        GioiTinh: data.GioiTinh,
        DiaChiKhachHang: data.DiaChi,
      },
    });

    // Audit log: customer registration
    await LogService.createLog({
      IDTaiKhoan: user.IDTaiKhoan,
      HanhDong: AUDIT_ACTIONS.DANG_KY_KHACH_HANG,
      DoiTuong: user.TenDangNhap,
      ChiTiet: `Khách hàng '${user.HoTenNguoiDung}' đã đăng ký tài khoản. Email: ${user.Email}`,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    return { token, user };
  }

  static async registerPartner(data: any, ip?: string) {
    const { token, user } = await this._createAccountAndSign(data, 'partner');

    const doiTac = await prisma.doiTac.create({
      data: {
        TenDoanhNghiep: data.TenDoanhNghiep,
        MaSoThue: data.MaSoThue,
        CaNhanDaiDien: data.CaNhanDaiDien,
        LinhVucKinhDoanh: data.LinhVucKinhDoanh,
        TrangThaiPheDuyet: 'PENDING',
        TrangThaiHoatDong: 'ACTIVE',
      },
    });

    await prisma.nhanVienDoiTac.create({
      data: {
        IDTaiKhoan: user.IDTaiKhoan,
        MaDoiTac: doiTac.MaDoiTac,
        ChucVu: 'Admin',
      },
    });

    // Audit log: partner registration
    await LogService.createLog({
      IDTaiKhoan: user.IDTaiKhoan,
      HanhDong: AUDIT_ACTIONS.DANG_KY_DOI_TAC,
      DoiTuong: data.TenDoanhNghiep,
      ChiTiet: `Đối tác '${data.TenDoanhNghiep}' đã đăng ký. MST: ${data.MaSoThue}. Người đại diện: ${data.CaNhanDaiDien || user.HoTenNguoiDung}`,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    return { token, user };
  }

  // ── Login ───────────────────────────────────────────────────────

  static async login(credentials: any) {
    const ip = credentials.ip;
    const username = credentials.TenDangNhap;

    // Look up the user — we need to know if they exist even if login fails
    const user = await prisma.taiKhoan.findUnique({
      where: { TenDangNhap: username },
      include: {
        Admin: true,
        KhachHang: true,
        NhanVienDoiTacs: true,
      },
    });

    // ── Handle: user doesn't exist ──
    if (!user) {
      // Log the failed attempt — account does not exist
      await LogService.createLog({
        IDTaiKhoan: null,
        HanhDong: AUDIT_ACTIONS.DANG_NHAP_THAT_BAI,
        DoiTuong: username,
        ChiTiet: `Tài khoản tồn tại: Không. Tên đăng nhập '${username}' không tồn tại trong hệ thống.`,
        DiaChiIP: ip,
        TrangThai: LOG_STATUS.FAILURE,
      });

      // Still run anomaly check for IP-level brute-force
      await AnomalyService.checkLoginAttempt({
        username,
        ip,
        targetAccountId: null,
        targetRole: undefined,
      });

      throw new Error('Invalid credentials');
    }

    // ── Handle: wrong password ──
    const isMatch = await bcrypt.compare(credentials.MatKhau, user.MatKhau);
    if (!isMatch) {
      const role = this._determineRole(user);

      // Log the failed attempt — account exists, wrong password
      await LogService.createLog({
        IDTaiKhoan: user.IDTaiKhoan,
        HanhDong: AUDIT_ACTIONS.DANG_NHAP_THAT_BAI,
        DoiTuong: username,
        ChiTiet: `Tài khoản tồn tại: Có, Vai trò: ${role}. Sai mật khẩu.`,
        DiaChiIP: ip,
        TrangThai: LOG_STATUS.FAILURE,
      });

      // Run anomaly checks — this may trigger CANH_BAO entries
      const { shouldNotifyUser } = await AnomalyService.checkLoginAttempt({
        username,
        ip,
        targetAccountId: user.IDTaiKhoan,
        targetRole: role,
      });

      // TODO: If shouldNotifyUser is true, send email/notification to the user
      // For now we just log it. Email integration can be added later.

      throw new Error('Invalid credentials');
    }

    // ── Handle: successful login ──
    const role = this._determineRole(user);
    const { MatKhau, Admin, KhachHang, NhanVienDoiTacs, ...safeUser } = user;

    const token = jwt.sign(
      {
        IDTaiKhoan: user.IDTaiKhoan,
        TenDangNhap: user.TenDangNhap,
        Email: user.Email,
        HoTenNguoiDung: user.HoTenNguoiDung,
        role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Audit log: successful login
    await LogService.createLog({
      IDTaiKhoan: user.IDTaiKhoan,
      HanhDong: AUDIT_ACTIONS.DANG_NHAP_THANH_CONG,
      DoiTuong: username,
      ChiTiet: `Vai trò: ${role}`,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    return { token, user: { ...safeUser, role } };
  }

  // ── Logout ──────────────────────────────────────────────────────

  static async logout(userId: number, username: string, ip?: string) {
    await LogService.createLog({
      IDTaiKhoan: userId,
      HanhDong: AUDIT_ACTIONS.DANG_XUAT,
      DoiTuong: username,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });
  }
}
