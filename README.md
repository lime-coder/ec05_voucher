# VoucherHub - E-Commerce Voucher Platform

Dự án này được thiết lập theo kiến trúc **Monorepo** (quản lý bằng `pnpm`). Nghĩa là toàn bộ code Frontend, Backend và các gói thư viện dùng chung (Packages) đều nằm trong một repository duy nhất.

Để đảm bảo source code đồng nhất, dễ maintain và quan trọng nhất là **không bị conflict Git** khi 4 người cùng làm, mọi người bắt buộc phải đọc và tuân thủ các quy chuẩn dưới đây trước khi code.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend
* **Core:** React 18 (TypeScript), Vite 
* **Styling:** Tailwind CSS v4, `tw-animate-css`
* **UI Components:** `shadcn/ui` + Radix UI (Headless)
* **Routing:** React Router v7
* **Forms:** React Hook Form + Zod
* **Data Fetching:** Dùng `axios` kết hợp `React Query` (nếu cần).

### Backend
* **Core:** Node.js, Express.js (TypeScript)
* **Database:** SQL Server
* **ORM:** Prisma
* **Validation:** Zod
* **Security:** bcrypt (Mã hóa Passwords), JWT (Authentication)

### Monorepo Tooling
* **Package Manager:** Bắt buộc dùng `pnpm` (Chạy `pnpm install`, **KHÔNG** dùng `npm install` hay `yarn`).

---

## 📁 Cấu Trúc Thư Mục (Folder Structure)

Kiến trúc đã được chia sẵn vùng làm việc. Ai được phân công module nào thì **chỉ tập trung code trong folder của module đó**.

```text
E-commerce voucher folder/
├── Backend/                 # Tầng API Server (Tất cả mọi người sẽ viết API của mình ở đây)
│   ├── prisma/              # Cấu hình Database (schema.prisma)
│   └── src/
│       ├── controllers/     # (1) Nhận Request từ FE -> Trả về Response JSON
│       ├── routes/          # (2) Định tuyến URL (VD: /api/vouchers)
│       └── services/        # (3) Xử lý logic nghiệp vụ và truy vấn Database
│
├── Frontend/                # Giao diện chính (Single Page Application)
│   └── src/app/
│       ├── admin/           # Khu vực code của người làm Admin View
│       ├── customer/        # Khu vực code của người làm Customer View
│       ├── partner/         # Khu vực code của người làm Partner View
│       ├── auth/            # Luồng Đăng nhập / Đăng ký
│       └── shared/          # Các Component/Context dùng chung cho cả 3 roles
│
└── packages/                # Thư viện dùng chung tự build
    ├── ui/                  # Các component gốc (Button, Input, Table...)
    ├── types/               # Chứa TypeScript Interface / Type
    └── utils/               # Các hàm helper xài chung
```

---

## 📜 Quy Chuẩn Lập Trình (Coding Conventions)

### 1. Quy tắc Đặt Tên (Naming)
* **React Components:** Bắt buộc dùng `PascalCase` (Ví dụ: `VoucherCard.tsx`, `PartnerDashboard.tsx`).
* **Hàm & Biến:** Dùng `camelCase` (Ví dụ: `fetchVoucherList()`, `userData`).
* **File Backend:** Tuân thủ chuẩn `[tên-chức-năng].[loại].ts` (Ví dụ: `voucher.controller.ts`, `auth.service.ts`).

### 2. Quy tắc Frontend
* **UI Components:** Dự án xài `shadcn/ui`. **TUYỆT ĐỐI KHÔNG** cài thêm Material UI, Ant Design hay Bootstrap. Cần component nào thì vào thư mục `components/ui` của view mình đang làm, hoặc thư mục `packages/ui` để lấy.
* **Styling:** Chỉ dùng Tailwind CSS class. **KHÔNG** dùng inline styles kiểu `style={{ color: 'red' }}`.
* **Ghép Class:** Luôn dùng hàm `cn()` được import từ `@voucherhub/ui/lib/utils` khi muốn ghép các class Tailwind kèm điều kiện.
* **Chia nhỏ Component:** Nếu một file `.tsx` dài quá 200 dòng code, hãy chủ động tách giao diện ra thành các component nhỏ hơn (như `Header.tsx`, `Table.tsx`...).

### 3. Quy tắc Backend (Controller - Service Pattern)
Để code không bị rác, Backend phải tuân thủ luồng 3 bước:
1. **Routes:** Chỉ dùng để định nghĩa đường dẫn (VD: `router.post('/', createVoucher)`).
2. **Controller:** Chỉ làm nhiệm vụ lấy dữ liệu từ `req.body`, `req.params`, gọi Service và `res.json()`. **KHÔNG** viết logic truy vấn database ở đây.
3. **Service:** Nơi đặt toàn bộ logic (Validate dữ liệu, Prisma query Database).

### 4. Quy tắc Làm Việc Nhóm (Git & Workflow)
* **Khoanh vùng làm việc:** Làm Partner? Đừng sửa code trong thư mục `Frontend/src/app/admin/`.
* **Database Schema:** **Tuyệt đối không** tự ý sửa đổi file `Backend/prisma/schema.prisma` (Thêm bảng, sửa cột) khi chưa bàn bạc với team, vì sẽ làm lỗi code của người khác.
* **Commit Git:** Ghi rõ ràng mình đã làm gì. (Ví dụ: `feat(partner): Hoàn thiện giao diện tạo voucher mới`, `fix(admin): Sửa lỗi hiển thị sai bảng người dùng`).

---

## 🚀 Hướng Dẫn Chạy Project (Getting Started)

1. **Cài đặt thư viện (Chỉ chạy 1 lần lúc mới clone):** 
   Mở terminal tại thư mục gốc `E-commerce voucher folder` và chạy:
   ```bash
   pnpm install
   ```

2. **Khởi chạy Frontend:**
   Mở một Terminal mới, cd vào thư mục Frontend và chạy:
   ```bash
   cd Frontend
   pnpm dev
   ```

3. **Khởi chạy Backend:**
   Mở một Terminal khác, cd vào thư mục Backend và chạy:
   ```bash
   cd Backend
   pnpm dev
   ```
   *(Nhớ cấu hình chuỗi kết nối SQL Server trong file `.env` của thư mục Backend)*
