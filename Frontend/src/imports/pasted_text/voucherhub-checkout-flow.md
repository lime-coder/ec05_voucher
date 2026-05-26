# Figma Prompt – VoucherHub Checkout & Order History Flow (Phần 2)

> **Đồng bộ Design System với Phần 1**  
> Dùng chung toàn bộ Color Styles, Typography, Component Library đã thiết lập ở Phần 1.  
> Brand: VoucherHub | Primary: `#00E5CC` | Dark: `#1A1A2E` | Muted: `#6B7280` | Danger: `#FF4444` | Surface: `#F5F6FA`  
> Frame size: 1440×900px (Desktop Web)

---

## 📐 Screen 8 – Shopping Cart (Giỏ hàng)

**Liên kết từ**: Screen 6 (Voucher Detail) → nhấn "Add to Cart" hoặc "Buy Now"  
**Navbar**: Logo trái + nav links (Shop | Deals | My Vouchers) + Cart icon + User avatar (đã đăng nhập)

**Breadcrumb / Step indicator (dưới page title)**:
- **REVIEW ITEMS** → CONFIRMATION → PAYMENT
- Bước hiện tại "REVIEW ITEMS" in đậm, các bước còn lại mờ (gray `#9CA3AF`)
- Dùng mũi tên `→` phân cách, không dùng số bước có vòng tròn

**Page Title**: `SHOPPING CART` – font chữ rất to, bold, uppercase, màu dark `#1A1A2E`

**Layout 2 cột**:
- Cột trái (rộng ~65%): danh sách voucher trong giỏ
- Cột phải (rộng ~30%): Order Summary box (sticky)

**Cột trái – Header row**:
- `3 ITEMS IN CART` (bold, uppercase, nhỏ) — bên phải: `Clear All` (text link, màu `#6B7280`)

**Cột trái – Voucher Item Row** (lặp lại cho mỗi voucher, có border outline, rounded 8px):
- Icon voucher placeholder (hình ticket/diamond, 64×64px, gray outline)
- Tên voucher: UPPERCASE BOLD (e.g. "SUMMER GETAWAY DELUXE")
- Mô tả ngắn: gray, nhỏ (e.g. "Valid for 2 Nights at Riverside Resort")
- Giá: bold đen (e.g. "$249.00")
- Quantity control: `[–] [1] [+]` – các nút có border, số ở giữa
- `🗑 Remove` – text link màu gray, icon thùng rác

  *3 voucher mẫu*:
  - SUMMER GETAWAY DELUXE | $249.00 | qty: 1
  - CITY DINING EXPERIENCE | $85.50 | qty: 2
  - EXTREME SPA PACKAGE | $120.00 | qty: 1

**Cột trái – Info Box (dưới danh sách)**:
- Border outline, 2 cột ngang:
  - 🔄 **EASY RETURNS** – "Cancel vouchers within 24 hours of purchase for a full refund."
  - ⚡ **INSTANT DELIVERY** – "Digital vouchers are sent immediately to your registered email address."

**Cột phải – ORDER SUMMARY box** (border outline, rounded, sticky):
- Title: `ORDER SUMMARY` (bold uppercase)
- Subtotal: $540.00
- Tax (8%) ℹ️: $43.20
- Platform Fee: $2.50
- Divider line
- **ESTIMATED TOTAL $585.70** (bold, lớn)
- Button: `[Checkout →]` – full-width, nền đen `#1A1A2E`, chữ trắng, bold
- Text nhỏ: "SECURE CHECKOUT POWERED BY WIREFLOW™"
- **ACCEPTED PAYMENTS**: 4 logo badges [VISA] [MC] [AMEX] [PP] – outlined boxes

**Footer**: Đồng bộ với Footer Phần 1 (4 cột: Logo+tagline | Customer Service | Company | Connect với social icons)

**→ Nhấn "Checkout →" → Screen 9**

---

## 📐 Screen 9 – Review Your Order / Confirmation (Xác nhận đơn hàng)

**Liên kết từ**: Screen 8 (Shopping Cart) → nhấn "Checkout"  
**Navbar**: Như Screen 8

**Breadcrumb**: CART / **CONFIRMATION** / PAYMENT  
*(CONFIRMATION in đậm, CART là link quay lại, PAYMENT mờ)*

**Page Title**: `REVIEW YOUR ORDER` – bold, uppercase, lớn  
**Subtitle**: "PLEASE VERIFY YOUR CONTACT DETAILS AND SELECTED VOUCHERS BEFORE PROCEEDING TO THE FINAL PAYMENT GATEWAY." – uppercase, nhỏ, gray

**Layout 3 cột ngang**:

**Cột 1 – STEP 1: BUYER INFORMATION**
- Header: badge đen `STEP 1` + `BUYER INFORMATION` bold uppercase
- Form fields (outlined input, label uppercase nhỏ):
  - FULL NAME (placeholder: "e.g. Alexander Hamilton")
  - PHONE NUMBER (placeholder: "+1 (555) 000-0000")
  - EMAIL ADDRESS (placeholder: "alexander@treasury.gov")
  - SHIPPING ADDRESS (textarea, placeholder: "123 Liberty Street, New York, NY 10006")

**Cột 2 – STEP 2: REVIEW VOUCHERS**
- Header: badge đen `STEP 2` + `REVIEW VOUCHERS` bold uppercase
- Box có border outline chứa danh sách voucher:
  - Mỗi row: Tên voucher BOLD + mô tả nhỏ + giá per item (right-aligned) + QTY badge (e.g. `QTY: 2`)
  - Divider giữa các row
  - 3 voucher:
    - PREMIUM DINING EXPERIENCE | Valid at 50+ locations | $150.00 per item | QTY: 2
    - LUXURY SPA RETREAT | Full Day Access + Massage | $299.00 per item | QTY: 1
    - CITY TOUR PASS | 48-Hour Unlimited Access | $75.00 per item | QTY: 3
  - Info note (icon ⚠️, text nhỏ): "DOUBLE CHECK YOUR ITEMS. ONCE PAYMENT IS CONFIRMED, DIGITAL VOUCHERS ARE ISSUED IMMEDIATELY AND ARE NON-REFUNDABLE."

**Cột 3 – STEP 3: TOTAL & PAY**
- Header: badge đen `STEP 3` + `TOTAL & PAY` bold uppercase
- ORDER SUMMARY box (border outline):
  - SUBTOTAL: $749.00
  - PROCESSING FEE: $12.50
  - TAX (CALCULATED): $45.00
  - Divider
  - **GRAND TOTAL $806.50** (rất bold, lớn)
  - Button: `[Pay Now 💳]` – full-width đen, chữ trắng
  - Text nhỏ: "🔒 SECURE ENCRYPTION ACTIVE"
- Link: `< Return to Shopping Cart`

**Dưới 3 cột – Final Verification Banner**:
- Dashed border (nét đứt), background nhẹ
- Title: `FINAL VERIFICATION CHECKPOINT` (bold)
- Text nhỏ uppercase: "BY CLICKING 'PAY NOW', YOU ACKNOWLEDGE THAT YOUR CONTACT INFORMATION IS CORRECT. VOUCHER CODES WILL BE SENT TO THE EMAIL ADDRESS PROVIDED IN COLUMN 1..."
- Bên phải: 2 badge [SSL SECURE] [TRUST VERIFIED]

**→ Nhấn "Pay Now" → Screen 10**

---

## 📐 Screen 10 – Select Payment Method (Chọn phương thức thanh toán)

**Liên kết từ**: Screen 9 → nhấn "Pay Now"  
**Navbar**: Như Screen 8

**Breadcrumb**: Cart > Confirmation > **Payment** *(Payment in đậm)*

**Page Title**: `Select Payment Method` – bold, lớn  
**Subtitle**: "Choose your preferred way to pay. All transactions are encrypted and secure."

**Layout 2 cột**:
- Cột trái (~60%): danh sách payment options
- Cột phải (~35%): Order Summary (static, không sticky)

**Cột trái – Payment Options** (mỗi option là 1 row card có border):

  Mỗi row:
  - Radio button (trái) + Icon phương thức + Tên bold + Mô tả nhỏ
  - Trạng thái selected: background nhẹ `#F5F6FA`, border đậm hơn

  3 lựa chọn:
  1. 🔲 **E-wallet** – "Pay instantly using PayPal, Apple Pay, or Google Pay."
  2. 🔵 **Credit / Debit Card** *(đang được chọn, highlighted)* – "Secure payment via Visa, Mastercard, or American Express."
  3. 🔲 **Bank Transfer** – "Direct transfer from your local bank account. (1–2 business days)"

  Security note (dashed border box):
  - 🛡️ "Your payment information is processed securely. We do not store your full card details on our servers."

**Cột phải – ORDER SUMMARY box**:
- Title: `ORDER SUMMARY` bold uppercase
- ITEMS (3):
  - Premium Voucher Pack: $240.00
  - Annual Membership: $150.00
  - Gift Card ($50): $50.00
- Subtotal: $440.00
- Processing Fee: $12.50
- Tax (VAT 10%): $45.25
- Divider
- **Order Total: $497.75** (bold, lớn)
- Button: `[Confirm Payment]` – full-width đen, chữ trắng, bold
- Link: `← Back to Order Details`
- Text: "Need help with your payment?" + **Contact Support 24/7** (bold link)

**→ Nhấn "Confirm Payment" → Thanh toán thành công → Screen 11**

---

## 📐 Screen 11 – Order History List (Lịch sử mua hàng)

**Liên kết từ**: Navbar "My Vouchers" hoặc sau thanh toán thành công  
**Navbar**: Logo trái + nav links (Orders | Support) + USER avatar icon (góc phải, dạng circle badge)

**Page Title**: `Order History List` – bold, lớn  
**Subtitle**: "Review your past transactions, track order status, and manage your purchased vouchers. Click 'View Details' to see individual order breakdowns and QR codes."

**Recent Transactions section**:
- Sub-title: `Recent Transactions` (bold) — bên phải: italic "Showing 7 most recent orders" + Dropdown sort `Mới nhất ▾`
- Search bar: icon kính lúp + placeholder "Search by Order ID or Voucher Name" (outlined, rộng ~350px)

**Table (dạng list có border)** – header row:
| Order ID (Mã đơn hàng) | Payment Time (Thời gian thanh toán) | Vouchers Included | Total | Action |
|---|---|---|---|---|

Mỗi data row (7 rows):
- Order ID: `#ORD-XXXXX` (bold, monospace font)
- Payment Time: `YYYY-MM-DD HH:MM` (gray)
- Vouchers Included: dropdown pill badge với tên voucher + chevron ▾ (có thể expand)
- Total: `$XXX.XX` (bold, right-aligned)
- Action: `[View Details]` button (outlined, small)

*Dữ liệu mẫu 7 rows*:
- #ORD-88291 | 2024-05-12 09:45 | Super Sale SB 10% | $124.50
- #ORD-88245 | 2024-05-10 14:20 | Lounge Access | $56.00
- #ORD-88190 | 2024-05-08 18:15 | VIP Pass | $210.99
- #ORD-88112 | 2024-05-05 11:30 | Daily Deal | $45.00
- #ORD-88001 | 2024-05-01 16:55 | Spring Promo | $89.20
- #ORD-87955 | 2024-04-28 10:05 | Mega Discount | $320.00
- #ORD-87820 | 2024-04-25 13:40 | Mini Snack | $12.50

**Notice box (dưới table)**:
- Border, background trắng
- Title: `Notice: Voucher Validity` (bold)
- Text: "Please ensure you check your vouchers' expiry dates. Expired vouchers cannot be refunded or reactivated..."

**→ Nhấn "View Details" trên bất kỳ row → Screen 12**

---

## 📐 Screen 12 – Order Detail & Voucher Codes (Chi tiết đơn hàng)

**Liên kết từ**: Screen 11 → nhấn "View Details"  
**Navbar**: Như Screen 11

**Back link**: `< Back to Orders`

**Order header (2 cột)**:
- Trái: Label `ORDER DETAILS` (uppercase, nhỏ, gray) + H1: `Order ID: #10023` (bold, lớn)
- Phải: `Purchase Date` (nhỏ, gray) + `2023-10-27` (bold)

**Your Vouchers section**:
- Title: `Your Vouchers` + badge `3 Items` (pill, outlined) — bên phải: "Vouchers are valid for 30 days after purchase." (italic, nhỏ, gray)

**Voucher Item Cards** (có 2 kiểu hiển thị):

**Kiểu 1 – Single voucher (qty=1)**:
Card row (border, rounded, background trắng):
- Icon ticket (trái, 40×40px gray)
- Tên voucher (bold) + Voucher code (nhỏ, monospace, gray, e.g. "COFFEE2024")
- UNIT PRICE: $XX.XX
- EXPIRATION DATE: YYYY-MM-DD
- Status badge: `Unused` (green outlined) hoặc `Used` (gray)
- Buttons: `[🔲 View QR]` + `[💬 Review]`
- Badge số lượng: `x1` (góc phải trên, nhỏ)

**Kiểu 2 – Grouped voucher (qty > 1, collapsible)**:
- Row cha: Tên voucher (bold) + TOTAL PRICE: $XX.XX + `Show Details <` link (phải)
- Khi expand: các sub-row con (indented, background `#F9FAFB`) mỗi sub-row là 1 voucher code riêng với đầy đủ thông tin

*Dữ liệu mẫu*:
- 50% Off Arabica Coffee | COFFEE2024 | $12.00 | 2024-12-31 | **Unused** | x1
- Buy 1 Get 1 Croissant (group x3) | $16.50 total | `Show Details <`
  - BAKERYBOGO1 | $5.50 | 2024-11-15 | Unused | View QR | Review
  - BAKERYBOGO2 | $5.50 | 2024-11-15 | Unused | View QR | Review
  - BAKERYBOGO3 | $5.50 | 2024-11-15 | Unused | View QR | Review
- $5 Off Specialty Tea | TEATIME5 | $5.00 | 2023-12-01 | **Used** (gray badge) | x1

**How to Use box (dưới danh sách)**:
- Border, background trắng
- Title: `HOW TO USE YOUR VOUCHERS` (bold uppercase)
- Bullet list (4 điểm):
  - Click "View QR Code" to show the merchant your voucher for scanning.
  - Once used, the status will automatically update to "Used".
  - Expired vouchers cannot be redeemed but can still be reviewed.
  - Leaving a review helps us improve the OrderFlow experience.

**→ Nhấn "Review" trên bất kỳ voucher → Screen 7 (Write a Review) đã có ở Phần 1**

---

## 🔗 Flow Connections – Phần 2 (Prototype Links)

```
Screen 8  (Shopping Cart)
  └─ Click "Checkout →"           → Screen 9  (Review Your Order)
       └─ Click "Pay Now"         → Screen 10 (Select Payment Method)
            └─ Click "Confirm Payment" → Screen 11 (Order History List)
                 └─ Click "View Details" → Screen 12 (Order Detail)
                      └─ Click "Review"  → Screen 7  (Write a Review) [Phần 1]

Navbar "My Vouchers"              → Screen 11 (Order History List)
```

---

## 🔗 Full Flow – Toàn bộ hệ thống (Phần 1 + Phần 2)

```
Screen 1  Homepage
  └─ Login/Register               → Screen 2  Login
       ├─ Register tab            → Screen 3  Register Customer
       │    └─ Partner tab        → Screen 4  Register Partner
       └─ Login success           → Screen 5  Search Results
            └─ View Detail        → Screen 6  Voucher Detail
                 ├─ Add to Cart   → Screen 8  Shopping Cart
                 │    └─ Checkout → Screen 9  Review Order
                 │         └─ Pay Now → Screen 10 Select Payment
                 │               └─ Confirm → Screen 11 Order History
                 │                     └─ View Details → Screen 12 Order Detail
                 │                           └─ Review → Screen 7 Write Review
                 └─ Buy Now       → Screen 9  Review Order (bỏ qua giỏ hàng)
```

---

## 💡 Figma Notes – Phần 2

**Components cần tạo thêm**:
- `CartItemRow` – variant: Default / Hover / Disabled
- `OrderSummaryBox` – dùng chung Screen 8, 9, 10
- `StepBreadcrumb` – 3 bước: Review Items / Confirmation / Payment
- `PaymentOptionRow` – variant: Unselected / Selected
- `OrderHistoryRow` – 1 row trong table
- `VoucherCodeRow` – variant: Unused / Used / Expired + Single / Grouped
- `VoucherGroupRow` – parent row (collapsible)
- `StatusBadge` – variant: Unused (green) / Used (gray) / Expired (red)
- `QRPlaceholder` – hình vuông 120×120px với pattern QR giả

**Color bổ sung**:
- `success/#10B981` – badge Unused (green)
- `neutral/#9CA3AF` – badge Used (gray)
- `warning/#F59E0B` – badge Expired

**Prototype interactions**:
- Step breadcrumb: Smart Animate giữa các bước
- Voucher group: Click "Show Details" → expand sub-rows (overlay hoặc push)
- Payment option: Click → radio chuyển trạng thái Selected
- Table row hover: background `#F5F6FA`

**Typography đồng bộ Phần 1**:
- Page titles lớn (Shopping Cart, Review Your Order): 40–48px, Black weight, uppercase
- Section headers: 16–18px, Bold
- Table headers: 12px, Semibold, uppercase, gray
- Body text: 14px, Regular
- Monospace (voucher codes): sử dụng font monospace cho tất cả voucher code

**Spacing & Layout**:
- Gutter giữa 2 cột: 32px
- Card padding: 20px
- Row height trong table: 64px
- Khoảng cách giữa các section: 48px