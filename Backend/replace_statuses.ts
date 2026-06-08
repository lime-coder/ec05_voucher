import fs from 'fs';
import path from 'path';

const searchDir = path.join(__dirname, 'src');

const replacements = [
  // DonHang
  { regex: /TrangThaiThanhToan\s*:\s*['"`]PAID['"`]/g, replacement: "TrangThaiThanhToan: 'Đã thanh toán'" },
  { regex: /TrangThaiThanhToan\s*===?\s*['"`]PAID['"`]/g, replacement: "TrangThaiThanhToan === 'Đã thanh toán'" },
  { regex: /TrangThaiThanhToan\s*!==?\s*['"`]PAID['"`]/g, replacement: "TrangThaiThanhToan !== 'Đã thanh toán'" },
  { regex: /TrangThaiThanhToan\s*:\s*\{\s*notIn\s*:\s*\[['"`]PAID['"`]/g, replacement: "TrangThaiThanhToan: { notIn: ['Đã thanh toán'" },

  // DoiTac TrangThaiHoatDong
  { regex: /TrangThaiHoatDong\s*:\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiHoatDong: 'Hoạt động'" },
  { regex: /TrangThaiHoatDong\s*===?\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiHoatDong === 'Hoạt động'" },
  { regex: /TrangThaiHoatDong\s*:\s*['"`]LOCKED['"`]/g, replacement: "TrangThaiHoatDong: 'Bị khóa'" },
  { regex: /TrangThaiHoatDong\s*===?\s*['"`]LOCKED['"`]/g, replacement: "TrangThaiHoatDong === 'Bị khóa'" },
  { regex: /TrangThaiHoatDong\s*:\s*['"`]INACTIVE['"`]/g, replacement: "TrangThaiHoatDong: 'Bị khóa'" },
  { regex: /TrangThaiHoatDong\s*===?\s*['"`]INACTIVE['"`]/g, replacement: "TrangThaiHoatDong === 'Bị khóa'" },

  // DoiTac TrangThaiPheDuyet
  { regex: /TrangThaiPheDuyet\s*:\s*['"`]APPROVED['"`]/g, replacement: "TrangThaiPheDuyet: 'Đã duyệt'" },
  { regex: /TrangThaiPheDuyet\s*===?\s*['"`]APPROVED['"`]/g, replacement: "TrangThaiPheDuyet === 'Đã duyệt'" },
  { regex: /TrangThaiPheDuyet\s*:\s*['"`]PENDING['"`]/g, replacement: "TrangThaiPheDuyet: 'Chờ duyệt'" },
  { regex: /TrangThaiPheDuyet\s*===?\s*['"`]PENDING['"`]/g, replacement: "TrangThaiPheDuyet === 'Chờ duyệt'" },
  { regex: /TrangThaiPheDuyet\s*:\s*['"`]REJECTED['"`]/g, replacement: "TrangThaiPheDuyet: 'Từ chối'" },
  { regex: /TrangThaiPheDuyet\s*===?\s*['"`]REJECTED['"`]/g, replacement: "TrangThaiPheDuyet === 'Từ chối'" },

  // Voucher TrangThaiVoucher
  { regex: /TrangThaiVoucher\s*:\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiVoucher: 'Đang hoạt động'" },
  { regex: /TrangThaiVoucher\s*===?\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiVoucher === 'Đang hoạt động'" },
  { regex: /TrangThaiVoucher\s*!==?\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiVoucher !== 'Đang hoạt động'" },
  { regex: /TrangThaiVoucher\s*:\s*['"`]PENDING_APPROVAL['"`]/g, replacement: "TrangThaiVoucher: 'Chờ duyệt'" },
  { regex: /TrangThaiVoucher\s*===?\s*['"`]PENDING_APPROVAL['"`]/g, replacement: "TrangThaiVoucher === 'Chờ duyệt'" },
  { regex: /TrangThaiVoucher\s*:\s*['"`]DRAFT['"`]/g, replacement: "TrangThaiVoucher: 'Bản nháp'" },
  { regex: /TrangThaiVoucher\s*===?\s*['"`]DRAFT['"`]/g, replacement: "TrangThaiVoucher === 'Bản nháp'" },
  { regex: /TrangThaiVoucher\s*:\s*['"`]REJECTED['"`]/g, replacement: "TrangThaiVoucher: 'Từ chối'" },
  { regex: /TrangThaiVoucher\s*===?\s*['"`]REJECTED['"`]/g, replacement: "TrangThaiVoucher === 'Từ chối'" },
  { regex: /TrangThaiVoucher\s*:\s*['"`]SUSPENDED['"`]/g, replacement: "TrangThaiVoucher: 'Tạm ngưng'" },
  { regex: /TrangThaiVoucher\s*===?\s*['"`]SUSPENDED['"`]/g, replacement: "TrangThaiVoucher === 'Tạm ngưng'" },

  // TaiKhoan TrangThaiTaiKhoan
  { regex: /TrangThaiTaiKhoan\s*:\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiTaiKhoan: 'Hoạt động'" },
  { regex: /TrangThaiTaiKhoan\s*===?\s*['"`]ACTIVE['"`]/g, replacement: "TrangThaiTaiKhoan === 'Hoạt động'" },
  { regex: /TrangThaiTaiKhoan\s*:\s*['"`]LOCKED['"`]/g, replacement: "TrangThaiTaiKhoan: 'Bị khóa'" },
  { regex: /TrangThaiTaiKhoan\s*===?\s*['"`]LOCKED['"`]/g, replacement: "TrangThaiTaiKhoan === 'Bị khóa'" },
  { regex: /TrangThaiTaiKhoan\s*:\s*['"`]INACTIVE['"`]/g, replacement: "TrangThaiTaiKhoan: 'Bị khóa'" },
  { regex: /TrangThaiTaiKhoan\s*===?\s*['"`]INACTIVE['"`]/g, replacement: "TrangThaiTaiKhoan === 'Bị khóa'" },

  // Admin and other general mappings where status variables are assigned or checked.
  // We need to be careful with variable assignments if they are returned to frontend.
];

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(searchDir);
console.log('Replacement complete.');
