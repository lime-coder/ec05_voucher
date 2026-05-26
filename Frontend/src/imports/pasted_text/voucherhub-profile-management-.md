# Figma Prompt – VoucherHub Profile Management Flow (Phần 3)

> **Đồng bộ Design System với Phần 1 & 2**  
> Dùng chung Color Styles, Typography, Component Library đã thiết lập.  
> Brand: VoucherHub | Primary: `#00E5CC` | Dark: `#1A1A2E` | Muted: `#6B7280` | Surface: `#F5F6FA`  
> Frame size: 1440×900px (Desktop Web)

---

## 📐 Screen 13 – Customer Profile Management (Hồ sơ khách hàng)

**Liên kết từ**: Navbar → click vào avatar/icon Account → chọn "Profile"  
**Navbar**: Đồng bộ Phần 1 (logo trái, search center, Account + Cart phải — trạng thái đã đăng nhập)

**Page Header (trái, có left border accent `#00E5CC` dày 4px)**:
- H1: `CUSTOMER PROFILE MANAGEMENT` – font rất bold, uppercase, dark `#1A1A2E`, cỡ 36–40px
- Subtitle: `TRANG DÀNH CHO KHÁCH HÀNG — ACCOUNT SETTINGS & IDENTITY VERIFICATION` – uppercase, nhỏ 11px, gray `#6B7280`
- Divider line ngang dưới header

**Layout 2 cột**:
- Cột trái – Sidebar menu (rộng ~200px)
- Cột phải – Nội dung form (chiếm phần còn lại)

**Sidebar menu (cột trái)**:
- Item 1: 🏠 icon + `Profile` – **đang active** (text bold, dark)
- Item 2: 🏠 icon + `Security` – inactive (gray)
- Không có border/background trên sidebar, chỉ dùng typography weight để phân biệt active/inactive

**Cột phải – PERSONAL INFORMATION section**:
- Section header: 👤 icon + `PERSONAL INFORMATION` (uppercase bold) + divider line ngang bên dưới

- **Field: USERNAME**
  - Label: `USERNAME` (uppercase, nhỏ, gray) với icon 👤
  - Input: outlined, background `#F5F6FA` (disabled/readonly), value: `alex_walker_99`
  - Helper text dưới: `UNIQUE SYSTEM IDENTIFIER. NON-EDITABLE.` – uppercase, rất nhỏ, gray italic
  - *Không có khả năng chỉnh sửa — visual cue: background khác màu*

- **Field: FULL NAME**
  - Label: `FULL NAME` (uppercase, nhỏ)
  - Input: outlined, editable, value: `Alex Walker`

- **Row 2 cột**:
  - Trái – Field: EMAIL (icon ✉️ + label `EMAIL`) | value: `alex.walker@provider.com`
  - Phải – Field: PHONE NUMBER (icon 📞 + label `PHONE NUMBER`) | value: `+1 (555) 000-1234`

- **Row 2 cột**:
  - Trái – Field: GENDER (icon dropdown ▾) | value: `MALE` | dropdown select
  - Phải – Field: DATE OF BIRTH (icon 📅 + label `DATE OF BIRTH`) | value: `1995-06-15`

- **Field: CURRENT RESIDENTIAL ADDRESS**
  - Label: `CURRENT RESIDENTIAL ADDRESS` (icon 📍)
  - Textarea (3 dòng), value: `123 Industrial Way, Suite 400, New York, NY`

**Action Buttons (dưới form)**:
- `[Discard Changes]` – outlined, background trắng, text dark
- `[💾 Save All Changes]` – filled đen `#1A1A2E`, text trắng, bold

**Footer**: Đơn giản, 1 dòng:
- Trái: `© 2026 PROFILE MANAGER - WIREFRAME UC-03` (uppercase, nhỏ, gray)
- Phải: `PRIVACY POLICY` | `TERMS OF SERVICE` | `SUPPORT` (text links, uppercase, nhỏ)

**→ Nhấn tab "Security" trong sidebar → Screen 15 (Changing Password)**

---

## 📐 Screen 14 – Partner Profile Management (Hồ sơ đối tác)

**Liên kết từ**: Đăng nhập bằng tài khoản Partner → vào Account → Profile  
**Lưu ý**: Đây là màn hình dành riêng cho Partner account, layout khác Customer

**Page Header**:
- Pill badge (outlined): `Profile Mode: Enterprise` – nhỏ, góc trên trái, border dark
- H1: `PARTNER PROFILE MANAGEMENT` – bold, uppercase, rất lớn, dark
- Divider line ngang ngay dưới H1 (full-width)

**Tabs navigation (dưới H1)**:
- `Profile` – **active**, underline đen dưới text, bold
- `Security` – inactive, gray
- *(Dạng tab nằm ngang, không có border box — chỉ dùng underline cho active)*

---

### Section 1 – COMPANY INFORMATION

**Section header row**:
- Icon box đen (🏢 icon trắng bên trong, 36×36px rounded)
- `COMPANY INFORMATION` – bold, uppercase, dark, cỡ 18px
- Italic subtitle: `Thông tin Đối tác / Doanh nghiệp` – gray, nhỏ
- Divider line ngang bên dưới

**Fields**:
- **COMPANY NAME (TÊN ĐỐI TÁC)** – full-width, icon 🏢, value: `TECHNOVA GLOBAL SOLUTIONS` (uppercase)
- **Row 2 cột**:
  - Trái: TAX CODE (MÃ SỐ THUẾ) – icon `#`, value: `0312984551`
  - Phải: BUSINESS EMAIL – icon ✉️, value: `admin@technova.co`
- **Row 2 cột**:
  - Trái: HOTLINE – icon 📞, value: `1900 6789`
  - Phải: HEADQUARTERS ADDRESS (ĐỊA CHỈ ĐỐI TÁC) – icon 📍, value: `Floor 12, Landmark Tower, 72nd Street, District 1, HCMC`

---

### Section 2 – REPRESENTATIVE INFORMATION

**Section header row**:
- Icon box đen (👤 icon trắng, 36×36px rounded)
- `REPRESENTATIVE INFORMATION` – bold, uppercase, dark
- Italic subtitle: `Nhân viên đối tác / Đại diện liên lạc` – gray, nhỏ
- Divider line ngang

**Fields (1 row 3 cột)**:
- CONTACT PERSON NAME (HỌ TÊN ĐẠI DIỆN) | value: `Nguyen Van Minh`
- STAFF EMAIL | value: `minh.nv@technova.co`
- STAFF PHONE NUMBER | value: `0987 654 321`

---

**Bottom action bar** (sticky hoặc cuối trang, có text hướng dẫn bên trái):
- Trái: `REVIEW ALL FIELDS CAREFULLY BEFORE SUBMITTING` – uppercase, nhỏ, gray
- Phải: 2 buttons:
  - `[Discard Changes]` – outlined, background trắng
  - `[💾 Save Changes]` – filled đen, text trắng, bold

**→ Nhấn tab "Security" → Screen 15 (Changing Password)**

---

## 📐 Screen 15 – Changing Password / Security Tab (Đổi mật khẩu)

**Liên kết từ**: Screen 13 hoặc 14 → nhấn tab "Security" trong sidebar/tabs  
**Hiển thị dưới dạng**: Nội dung thay thế vào cột phải (giữ nguyên sidebar/tabs bên trái), HOẶC modal overlay — tùy chọn khi thiết kế prototype

**Section header**:
- 🔒 icon + `CHANGING PASSWORD` – bold, uppercase, dark, cỡ 24px
- Divider line ngang bên dưới

**Form fields (single column, full-width)**:

- **Current Password**
  - Label: `Current Password` (bold, 14px)
  - Input: outlined, icon 🔒 trái, placeholder: `Enter your current password`

- **New Password**
  - Label: `New Password` (bold)
  - Input: outlined, icon 🔑 trái, placeholder: `Create a strong password`

- **Confirm New Password**
  - Label: `Confirm New Password` (bold)
  - Input: outlined, icon 🛡️ trái, placeholder: `Re-type your new password`

**Error State Box** (hiển thị khi nhập sai mật khẩu hiện tại):
- Background: `#F3F4F6` (light gray), border: `#E5E7EB`, rounded 8px
- Icon ⚠️ + **`Authorization Error`** (bold, dark)
- Text: `Invalid current password. Please try again!` – gray, nhỏ
- *Tạo Variant: Default (ẩn error box) / Error (hiện error box)*

**Action Buttons**:
- `[✕ Cancel]` – outlined, icon X trái, text dark
- `[💾 Save Changes]` – filled đen `#1A1A2E`, text trắng, bold, icon floppy disk

---

## 🔗 Flow Connections – Phần 3 (Prototype Links)

```
Navbar Avatar / Account icon
  ├─ Customer login  → Screen 13 (Customer Profile – tab Profile active)
  │    └─ Click "Security" tab  → Screen 15 (Changing Password)
  │         ├─ Submit đúng      → Toast "Password updated successfully" → Screen 13
  │         └─ Submit sai       → Error box xuất hiện (Variant Error) → ở lại Screen 15
  └─ Partner login   → Screen 14 (Partner Profile – tab Profile active)
       └─ Click "Security" tab  → Screen 15 (Changing Password)
```

---

## 🔗 Full Flow – Toàn bộ hệ thống (Phần 1 + 2 + 3)

```
Screen 1   Homepage
  └─ Login/Register              → Screen 2   Login
       ├─ Register tab           → Screen 3   Register Customer
       │    └─ Partner tab       → Screen 4   Register Partner
       └─ Login success
            ├─ [Customer]        → Screen 5   Search Results
            │    └─ View Detail  → Screen 6   Voucher Detail
            │         ├─ Add to Cart → Screen 8  Shopping Cart
            │         │    └─ Checkout → Screen 9  Review Order
            │         │         └─ Pay Now → Screen 10 Select Payment
            │         │               └─ Confirm → Screen 11 Order History List
            │         │                     └─ View Details → Screen 12 Order Detail
            │         │                           └─ Review → Screen 7  Write a Review
            │         └─ Buy Now → Screen 9  (bỏ qua giỏ)
            └─ Navbar Avatar     → Screen 13 Customer Profile
                 └─ Security tab → Screen 15 Changing Password
            [Partner login]      → Screen 14 Partner Profile
                 └─ Security tab → Screen 15 Changing Password
```

---

## 💡 Figma Notes – Phần 3

**Components cần tạo thêm**:
- `ProfileSidebar` – variant: Customer / Partner
- `ProfileTabBar` – dành cho Partner (dạng tab ngang có underline)
- `FormFieldReadonly` – input disabled với background `#F5F6FA` + helper text "NON-EDITABLE"
- `SectionHeader` – icon box đen + title bold + subtitle italic + divider (dùng cho Partner profile)
- `PasswordField` – input type password với icon toggle show/hide
- `ErrorAlertBox` – variant: Hidden / Visible (dùng cho form error state)
- `ActionButtonBar` – pair buttons: [Discard] + [Save] — dùng chung Screen 13, 14, 15

**Variants cần thiết lập**:
- `FormInput` variants: Default / Focused / Disabled / Error
- `Screen 15 (Changing Password)` variants: Default (no error) / Error State (show error box)

**Typography đồng bộ Phần 1 & 2**:
- Page title uppercase bold: 36–40px, Black weight
- Section header uppercase: 16–18px, Bold
- Field label uppercase: 11–12px, Semibold, letter-spacing rộng
- Input value: 14px, Regular
- Helper text: 10–11px, Italic, gray

**Spacing**:
- Sidebar width: 200px | Gap giữa sidebar và form: 48px
- Section gap (giữa COMPANY INFO và REPRESENTATIVE INFO): 48px
- Field gap: 24px vertical | 16px horizontal (trong 2-col grid)
- Button height: 48px | Button gap: 12px

**Color bổ sung Phần 3**:
- `readonly-bg/#F5F6FA` – background input non-editable
- `error-bg/#F3F4F6` – background error alert box
- `error-border/#E5E7EB` – border error box
- `section-icon-bg/#1A1A2E` – nền icon box tối (Partner profile section headers)