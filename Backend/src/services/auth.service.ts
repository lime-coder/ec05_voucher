import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LogService } from './log.service';
import { AnomalyService } from './anomaly.service';
import { AUDIT_ACTIONS, LOG_STATUS } from '../config/audit.config';

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
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
        TrangThaiTaiKhoan: 'Hoạt động',
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

  static async checkAvailability(username: string, email: string, phone: string) {
    const existingUser = await prisma.taiKhoan.findFirst({
      where: {
        OR: [
          { TenDangNhap: username },
          { Email: email }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.TenDangNhap.toLowerCase() === username.toLowerCase()) {
        throw new Error('Username is already taken');
      }
      if (existingUser.Email.toLowerCase() === email.toLowerCase()) {
        throw new Error('Email is already registered');
      }
    }

    if (phone) {
      const existingPhone = await prisma.khachHang.findUnique({
        where: { SDT_KH: phone }
      });

      if (existingPhone) {
        throw new Error('Phone number is already registered');
      }
    }

    return { available: true };
  }

  static async registerCustomer(data: any, ip?: string) {
    const hashedPassword = await bcrypt.hash(data.MatKhau, 10);

    // Atomic transaction: both TaiKhoan and KhachHang succeed or neither does
    const { taiKhoan, khachHang } = await prisma.$transaction(async (tx) => {
      const taiKhoan = await tx.taiKhoan.create({
        data: {
          TenDangNhap: data.TenDangNhap,
          MatKhau: hashedPassword,
          Email: data.Email,
          HoTenNguoiDung: data.HoTenNguoiDung,
          TrangThaiTaiKhoan: 'Hoạt động',
        },
      });

      const khachHang = await tx.khachHang.create({
        data: {
          SDT_KH: data.SDT,
          IDTaiKhoan: taiKhoan.IDTaiKhoan,
          NgaySinh: data.NgaySinh ? new Date(data.NgaySinh) : undefined,
          GioiTinh: data.GioiTinh,
          DiaChiKhachHang: data.DiaChi,
        },
      });

      return { taiKhoan, khachHang };
    });

    // JWT signing only happens AFTER transaction succeeds
    const token = jwt.sign(
      {
        IDTaiKhoan: taiKhoan.IDTaiKhoan,
        TenDangNhap: taiKhoan.TenDangNhap,
        Email: taiKhoan.Email,
        HoTenNguoiDung: taiKhoan.HoTenNguoiDung,
        role: 'customer',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const user = { ...taiKhoan, role: 'customer' as const };

    // Audit log: customer registration (non-critical, outside transaction)
    await LogService.createLog({
      IDTaiKhoan: taiKhoan.IDTaiKhoan,
      HanhDong: AUDIT_ACTIONS.DANG_KY_KHACH_HANG,
      DoiTuong: taiKhoan.TenDangNhap,
      ChiTiet: `Khách hàng '${taiKhoan.HoTenNguoiDung}' đã đăng ký tài khoản. Email: ${taiKhoan.Email}`,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    return { token, user };
  }

  static async registerPartner(data: any, ip?: string) {
    const hashedPassword = await bcrypt.hash(data.MatKhau, 10);

    // Atomic transaction: TaiKhoan, DoiTac, and NhanVienDoiTac all succeed or none
    const { taiKhoan, doiTac } = await prisma.$transaction(async (tx) => {
      const taiKhoan = await tx.taiKhoan.create({
        data: {
          TenDangNhap: data.TenDangNhap,
          MatKhau: hashedPassword,
          Email: data.Email,
          HoTenNguoiDung: data.TenDoanhNghiep,
          TrangThaiTaiKhoan: 'Chờ duyệt',
        },
      });

      const doiTac = await tx.doiTac.create({
        data: {
          TenDoanhNghiep: data.TenDoanhNghiep,
          MaSoThue: data.MaSoThue,
          CaNhanDaiDien: data.CaNhanDaiDien,
          LinhVucKinhDoanh: data.LinhVucKinhDoanh,
          TrangThai: 'Chờ duyệt',
          EmailLienHe: data.EmailLienHe || 'contact@domain.com',
          SDTLienHe: data.SDTLienHe || '0000000000',
        },
      });

      await tx.nhanVienDoiTac.create({
        data: {
          IDTaiKhoan: taiKhoan.IDTaiKhoan,
          MaDoiTac: doiTac.MaDoiTac,
          ChucVu: data.ChucVu,
        },
      });

      return { taiKhoan, doiTac };
    });

    // Audit log: partner registration (non-critical, outside transaction)
    await LogService.createLog({
      IDTaiKhoan: taiKhoan.IDTaiKhoan,
      HanhDong: AUDIT_ACTIONS.DANG_KY_DOI_TAC,
      DoiTuong: data.TenDoanhNghiep,
      ChiTiet: `Đối tác '${data.TenDoanhNghiep}' đã đăng ký. MST: ${data.MaSoThue}. Người đại diện: ${data.CaNhanDaiDien || taiKhoan.HoTenNguoiDung}`,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    return { message: 'Partner registration submitted for review' };
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
        NhanVienDoiTacs: { include: { DoiTac: true } },
      },
    });

    // ── Handle: user doesn't exist or case mismatch ──
    if (!user || user.TenDangNhap !== username) {
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

    const currentRole = this._determineRole(user);

    // ── Handle: Partner is locked ──
    if (currentRole === 'partner' && user.NhanVienDoiTacs?.[0]?.DoiTac) {
      if (user.NhanVienDoiTacs[0].DoiTac.TrangThai === 'Bị khóa') {
        await LogService.createLog({
          IDTaiKhoan: user.IDTaiKhoan,
          HanhDong: AUDIT_ACTIONS.DANG_NHAP_THAT_BAI,
          DoiTuong: username,
          ChiTiet: `Tài khoản tồn tại: Có, Vai trò: ${currentRole}. Đăng nhập thất bại do Đối tác chủ quản đang bị khóa.`,
          DiaChiIP: ip,
          TrangThai: LOG_STATUS.FAILURE,
        });
        throw new Error('Your partner enterprise account is currently locked. Please contact support.');
      }
    }

    // ── Handle: not ACTIVE account ──
    if (user.TrangThaiTaiKhoan !== 'Hoạt động') {
      const role = this._determineRole(user);

      await LogService.createLog({
        IDTaiKhoan: user.IDTaiKhoan,
        HanhDong: AUDIT_ACTIONS.DANG_NHAP_THAT_BAI,
        DoiTuong: username,
        ChiTiet: `Tài khoản tồn tại: Có, Vai trò: ${role}. Đăng nhập thất bại do tài khoản không ở trạng thái Hoạt động (Trạng thái hiện tại: ${user.TrangThaiTaiKhoan}).`,
        DiaChiIP: ip,
        TrangThai: LOG_STATUS.FAILURE,
      });

      throw new Error('There has been a problem with your account, please contact customer support for further details');
    }

    // ── Handle: successful login ──
    const role = this._determineRole(user);
    const { MatKhau, Admin, KhachHang, NhanVienDoiTacs, ...safeUser } = user;
    const MaDoiTac = role === 'partner' && NhanVienDoiTacs && NhanVienDoiTacs.length > 0 ? NhanVienDoiTacs[0].MaDoiTac : undefined;

    const tokenPayload: any = {
      IDTaiKhoan: user.IDTaiKhoan,
      TenDangNhap: user.TenDangNhap,
      Email: user.Email,
      HoTenNguoiDung: user.HoTenNguoiDung,
      role,
    };
    if (MaDoiTac) {
      tokenPayload.MaDoiTac = MaDoiTac;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: JWT_EXPIRES_IN });

    // Audit log: successful login
    await LogService.createLog({
      IDTaiKhoan: user.IDTaiKhoan,
      HanhDong: AUDIT_ACTIONS.DANG_NHAP_THANH_CONG,
      DoiTuong: username,
      ChiTiet: `Vai trò: ${role}`,
      DiaChiIP: ip,
      TrangThai: LOG_STATUS.SUCCESS,
    });

    return { token, user: { ...safeUser, role, MaDoiTac } };
  }

  // ── Verify Me ───────────────────────────────────────────────────

  static async me(userId: number, role: string) {
    const user = await prisma.taiKhoan.findUnique({
      where: { IDTaiKhoan: userId },
      include: { NhanVienDoiTacs: true }
    });
    if (!user) throw new Error('User not found');

    const { MatKhau, NhanVienDoiTacs, ...safeUser } = user;
    const MaDoiTac = role === 'partner' && NhanVienDoiTacs && NhanVienDoiTacs.length > 0 ? NhanVienDoiTacs[0].MaDoiTac : undefined;

    return { user: { ...safeUser, role, MaDoiTac } };
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
