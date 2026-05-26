# Figma Prompt – VoucherHub Customer Flow

## 🎨 Design System & Visual Identity

*Brand*: VoucherHub  
*Logo*: Diamond/gem icon in cyan (#00E5CC) + wordmark "VoucherHub" in dark text  
*Primary Color*: Cyan / Turquoise – #00E5CC  
*Background*: White #FFFFFF / Light gray #F5F6FA  
*Text*: Dark charcoal #1A1A2E (headings), Medium gray #6B7280 (body/secondary)  
*Accent*: Coral/red for discount badges #FF4444  
*CTA Buttons*: Filled cyan with dark text, rounded corners (8px), full-width on mobile  
*Typography*: Bold sans-serif for headings, regular weight for body  
*Card style*: White background, subtle shadow, 12px rounded corners  
*Navbar*: White, sticky top, logo left – search bar center – Account icon + Cart icon right  

---

## 📐 Screen 1 – Homepage (Trang chủ)

*Layout*: Full-width desktop web (1440px wide)

*Navbar (top)*
- Left: VoucherHub logo (diamond icon + text)
- Center: Search bar with placeholder "Search for restaurants, hotels, spa treatments…" + cyan Search button
- Right: Person icon "Login / Register" | Shopping cart icon with badge "0"

*Hero Section*
- Left column (text):
  - Pill badge: "SUMMER SALE IS HERE" (cyan outline)
  - H1: "Unbeatable Deals on" (black) + "Premium Experiences" (cyan)
  - Body: "Discover local favorites and world-class luxury at up to 70% off…"
  - Two buttons: [Explore Deals] (cyan filled) | [How it Works] (white outlined)
- Right column: Large rounded image of food/experience + floating card "Flash Sale ends in 02:45:12" (countdown timer with orange clock icon)

*Explore Categories*
- Section title "Explore Categories" (bold) + "Browse all >" link (cyan)
- 6 icon + label cards in a row: Food & Dining | Travel | Spa & Beauty | Entertainment | Fitness | Automotive
- Each card: circular cyan-tinted icon background, label below

*Flash Sale Vouchers*
- Section header: Red left border | "Flash Sale Vouchers" (bold) | clock icon "Ends in: 14h 22m" | [View All Offers] button (outlined)
- 4 voucher cards in a row:
  - Image (top, with red discount badge e.g. "-50%")
  - Category tag (e.g. "FOOD" in cyan small caps)
  - Voucher name (bold)
  - Partner name (italic gray)
  - Price: new price (bold black) + old price (strikethrough gray)
  - [Buy Now] button (full-width cyan)

*Footer*
- Logo + tagline on left
- 4 columns: Quick Links | Customer Support | Contact Info | Social icons
- Bottom bar: copyright + policy links

*→ User clicks "Login / Register" in navbar → goes to Screen 2*

---

## 📐 Screen 2 – Login / Register (Đăng nhập / Đăng ký)

*Layout*: Centered card (560px wide) on light gray page background

*Navbar*: Same as homepage (no search bar on this screen)

*Card content*:
- Avatar placeholder circle (top center)
- H2: "Hello"
- Subtitle: "Access the world's most exclusive voucher marketplace."
- Toggle tabs: [Login] (active, cyan underline) | [Register]

*Login tab (default)*:
- Field: Username or Email (envelope icon, placeholder "e.g. alex@vouchersphere.com")
- Field: Password (lock icon) + "Forgot Password?" link (cyan, right-aligned)
- Button: [Login to Portal] (full-width cyan, bold)

*Register tab (on click)*:
- → Navigate to Screen 3 (Customer Register) or Screen 4 (Partner Register)
- Show sub-tabs: [Customer Account] (active) | [Partner Account]

*Below the card*:
- 3 trust badges in a row: 🔒 Secure Transacting | 👥 Large Network | 📊 Real-time Analytics
- Each has icon + title + short description

*→ User logs in as customer → goes to Screen 5 (Homepage logged in / Search)*

---

## 📐 Screen 3 – Register Customer Account (Đăng ký khách hàng)

*Layout*: Centered card (760px) on white page

*Header*:
- H2: "Register New Account"
- Subtitle: "Choose your account type and provide your details to get started."
- Sub-tabs: [Customer Account] (active, cyan) | [Partner Account]

*Section: Personal Information*
- 2-column grid of fields:
  - Username | Email Address
  - Password | Full Name
  - Phone Number | Date of Birth
- Full-width: Gender (dropdown "Select Gender")
- Full-width: Residential Address (location pin icon)

*Bottom*:
- [Register Now →] button (full-width cyan)
- "Already have an account? Login here" (cyan link)
- Legal text: "By clicking 'Register Now', you agree to our Terms of Service and Privacy Policy…"

*→ Registration complete → goes to Screen 2 login → then Screen 5*

---

## 📐 Screen 4 – Register Partner Account (Đăng ký đối tác)

*Layout*: Centered card (760px)

*Header*:
- H2: "Register Partner Account"
- Subtitle: "Expand your business reach. Join our ecosystem to list and sell your digital vouchers…"

*Two-column form*:
- Left – ACCOUNT DETAILS:
  - Username (Tên đăng nhập) *
  - Password (Mật khẩu) *
  - Email Address *
  - Full Name (Họ tên người dùng) *
  - Job Position (Chức vụ) *
- Right – BUSINESS DETAILS:
  - Company Name (Tên doanh nghiệp) *
  - Tax ID (Mã số thuế) *
  - Legal Representative (Cá nhân đại diện) *
  - Business Field (Lĩnh vực kinh doanh) * (dropdown, default "Retail & Shopping")
  - Info box (blue): "Please ensure all business information matches your legal registration documents…"

*Bottom*:
- [Submit Application →] (full-width cyan)
- "* Our administration team will review your application within 2–3 business days."
- "Already a partner? Login here >" (cyan link)
- Footer policy links

---

## 📐 Screen 5 – Search Results (Tìm kiếm voucher)

*Layout*: 2-column: left sidebar (filters) + right content area

*Navbar*: Same as homepage but user is logged in → right shows "ACCOUNT" icon + "CART" with badge (3)

*Breadcrumb*: Home > Experience > Search Results

*Page Title*: Search Results for *"Wellness & Spa"* (keyword in cyan quotes)  
*Subtitle*: Showing 1–9 of 124 vouchers found

*Sort bar*: SORT BY: [Most Popular] [Newest] [Price: Low to High] [Price: High to Low] | Per page: 24 | Grid/List toggle

*Left Sidebar – Filters*:
- Title "Filters" + "Clear All" (cyan link)
- CATEGORIES (checkboxes with count): Travel & Hotels (24) | Food & Beverages (18) | Wellness & Spa (12) | Entertainment (😎 | Sports & Fitness (15)
- BRANDS / PROVIDERS (checkboxes): Marriott Int. | Starbucks | Hilton Resorts | Nike Store
- LOCATION (dropdown "California (124)" with nested checkboxes: Los Angeles 42 | San Francisco 28 | San Diego 19 → Downtown 12, Hollywood 😎 | New York (98)
- PRICE RANGE: slider from $10 to $1000+

*Right – Voucher Grid (3 columns, 3 rows = 9 cards)*:

Each card:
- Image (top, 16:9 ratio) with colored badge "X% OFF" top-left + "Flash Deal" pill
- Provider avatar + name
- Voucher title (bold, 2 lines max)
- Star rating (empty stars ☆☆☆☆☆) + review count in parentheses
- Price: *$XXX* (bold cyan/black) + ~$XXX~ (strikethrough gray)
- [View Detail] button (cyan)

*Pagination*: < | 1 (active, cyan) | 2 | 3 | … | 12 | >

*→ User clicks "View Detail" on a card → goes to Screen 6*

---

## 📐 Screen 6 – Voucher Detail (Chi tiết voucher)

*Layout*: Full-width, single column content

*Navbar*: Same as logged-in state

*Product Section (top, 2-column)*:
- Left: Main image (large, rounded) with "BEST SELLER" red badge top-left + 4 thumbnail images below
- Right:
  - Category tag: "SPA & WELLNESS" (cyan pill) + "Multiple Locations" (location icon)
  - H1: Voucher name (e.g. "Grand Bliss Royal Massage & Hydro-Aromatherapy (90 Min)")
  - Rating: ⭐ 4.8 + "See all 248 reviews" (cyan link) + "1.2k Sold"
  - Price: *$129.00* (large, cyan) ~$245.00~ + "47% OFF" badge (red)
  - Note: "Price includes all service taxes and VAT."
  - Stock bar: "Stock remaining" progress bar (red, nearly empty) + "Only 14 left!" (red text)
  - Quantity selector: [–] [1] [+]
  - Two CTA buttons side by side: [🛒 Add to Cart] (outlined) | [Buy Now] (cyan filled, bold)

*Partner Info Card*:
- Diamond icon + "Ethereal Zen Wellness Spa" (bold) + "Visit Brand Store >" (cyan)
- Short description paragraph

*Tabs*: Description | Usage Conditions | Applicable Branches | Cancellation Policy
- Default tab: Description
  - Section title bold
  - 2 paragraphs
  - 2-column feature checklist with cyan checkmark icons

*Customer Reviews Section*:
- Header: "Customer Reviews" + score "4.5 ★★★★☆" + "BASED ON 248 REVIEWS"
- Review cards (3 shown):
  - Avatar | Name | Star rating | Date | "Verified Purchase" badge (green)
  - Review text
  - (Some cards) Partner Response section: cyan left border, italic quote
- [Load More Reviews] button (outlined, centered)

*→ User navigates to purchase history → Screen 7*  
(Note: Cart and Order flow are separate; this prompt focuses on the customer read flow)

---

## 📐 Screen 7 – Write a Review (Đánh giá voucher)

*Layout*: Centered card (640px) on light gray background

*Navbar*: Same logged-in state

*Back link*: "← Back to Purchased History"

*Card*:
- H2: "Write a Review"
- Subtitle: "Your feedback helps millions of shoppers find the best deals and helps merchants improve their services."

*Voucher info row* (inside card, bordered):
- Small product thumbnail (left)
- "Purchased" pill badge
- Provider name: "The Grand Waterfront Hotel – Marina Bay"
- Voucher name: *"Premium Weekend Seafood Buffet for Two"* (bold)
- "Used at: ✅" + "Redeemed on October 24, 2023"

*Divider line*

*Rate Your Experience*:
- Label: "RATE YOUR EXPERIENCE:" (uppercase, small)
- 5 empty star icons (☆☆☆☆☆), clickable, large size

*Share Your Detailed Experience*:
- Label: "SHARE YOUR DETAILED EXPERIENCE:" (uppercase)
- Textarea with placeholder: "Tell us about the atmosphere, service quality, and the value of this voucher. What did you enjoy most? Was the redemption process smooth?"
- Bottom row: ⓘ "Minimum 20 characters recommended" (left) | "0/500" counter (right)

*Buttons*:
- [Cancel] (white/outlined) | [Submit Review] (cyan filled)

---

## 🔗 Flow Connections (Prototype Links)

Screen 1 (Homepage)
  └─ Click "Login / Register" (navbar) → Screen 2 (Login)
       ├─ Click "Register" tab → Screen 3 (Customer Register)
       │    └─ Click "Partner Account" tab → Screen 4 (Partner Register)
       └─ Login success → Screen 5 (Search Results)
            └─ Click "View Detail" on any card → Screen 6 (Voucher Detail)
                 └─ Navigate to Purchase History → Screen 7 (Write a Review)

---

## 💡 Figma Notes

- Use *Auto Layout* on all cards and sections
- Set up a *Color Styles*: primary/#00E5CC, text-dark/#1A1A2E, text-muted/#6B7280, danger/#FF4444, surface/#F5F6FA
- Create *Components* for: Navbar, VoucherCard, ReviewCard, StarRating, PriceBlock, CategoryPill, FilterSidebar
- Use *Variants* on VoucherCard for states: Default, Hover, Sold Out
- Prototype interactions: Smart Animate for tab switching; Navigate for screen-to-screen flow
- Frame sizes: Desktop = 1440×900px, use horizontal scroll if needed