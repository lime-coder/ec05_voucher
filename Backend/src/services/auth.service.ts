import prisma from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LogService } from './log.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_voucherhub_change_in_production';
const JWT_EXPIRES_IN = '30m';

export class AuthService {
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

  static async registerCustomer(data: any) {
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

    return { token, user };
  }

  static async registerPartner(data: any) {
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

    return { token, user };
  }

  static async login(credentials: any) {
    const user = await prisma.taiKhoan.findUnique({
      where: { TenDangNhap: credentials.TenDangNhap },
      include: {
        Admin: true,
        KhachHang: true,
        NhanVienDoiTacs: true,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(credentials.MatKhau, user.MatKhau);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    let role: 'admin' | 'partner' | 'customer' = 'customer';
    if (user.Admin) {
      role = 'admin';
    } else if (user.NhanVienDoiTacs && user.NhanVienDoiTacs.length > 0) {
      role = 'partner';
    } else if (user.KhachHang) {
      role = 'customer';
    }

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

    // Capture log
    await LogService.createLog({
      IDTaiKhoan: user.IDTaiKhoan,
      HanhDong: 'Đăng nhập hệ thống',
      DoiTuong: user.TenDangNhap,
      DiaChiIP: credentials.ip, // IP passed from controller
      TrangThai: 'Thành công'
    });

    return { token, user: { ...safeUser, role } };
  }
}
