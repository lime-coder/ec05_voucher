-- ============================================================
-- Script tự động sinh dữ liệu mẫu hệ thống Voucher Hub (SQL Server)
-- Phiên bản đã sửa lỗi & bổ sung đầy đủ & chuẩn hóa kiểu dữ liệu
-- ============================================================


-- ============================================================
-- BƯỚC 1: Vô hiệu hóa toàn bộ ràng buộc khóa ngoại
-- ============================================================
DECLARE @sql_disable NVARCHAR(MAX) = N'';
SELECT @sql_disable += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.'
    + QUOTENAME(OBJECT_NAME(parent_object_id))
    + ' NOCHECK CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys;
EXEC sp_executesql @sql_disable;


-- ============================================================
-- BƯỚC 2: Xóa sạch dữ liệu tất cả các bảng
-- ============================================================
DELETE FROM [sysdiagrams];
DELETE FROM [SystemLog];
DELETE FROM [MaVoucher];
DELETE FROM [ChiTietDonHang];
DELETE FROM [DonHang];
DELETE FROM [ChiTietGioHang];
DELETE FROM [GioHang];
DELETE FROM [DanhGia];
DELETE FROM [Voucher_ChiNhanh];
DELETE FROM [Voucher];
DELETE FROM [ChiNhanh];
DELETE FROM [NhanVienDoiTac];
DELETE FROM [DoiTac];
DELETE FROM [KhachHang];
DELETE FROM [Admin];
DELETE FROM [TaiKhoan];
DELETE FROM [DanhMuc];
DELETE FROM [FAQ];
DELETE FROM [BaiViet];
DELETE FROM [Banner];


-- ============================================================
-- BƯỚC 3: Reset toàn bộ IDENTITY về 0
-- ============================================================
DBCC CHECKIDENT ('[SystemLog]',       RESEED, 0);
DBCC CHECKIDENT ('[ChiTietDonHang]',  RESEED, 0);
DBCC CHECKIDENT ('[DonHang]',         RESEED, 0);
DBCC CHECKIDENT ('[ChiTietGioHang]',  RESEED, 0);
DBCC CHECKIDENT ('[GioHang]',         RESEED, 0);
DBCC CHECKIDENT ('[DanhGia]',         RESEED, 0);
DBCC CHECKIDENT ('[Voucher_ChiNhanh]',RESEED, 0);
DBCC CHECKIDENT ('[Voucher]',         RESEED, 0);
DBCC CHECKIDENT ('[ChiNhanh]',        RESEED, 0);
DBCC CHECKIDENT ('[NhanVienDoiTac]',  RESEED, 0);
DBCC CHECKIDENT ('[DoiTac]',          RESEED, 0);
DBCC CHECKIDENT ('[TaiKhoan]',        RESEED, 0);
DBCC CHECKIDENT ('[DanhMuc]',         RESEED, 0);
DBCC CHECKIDENT ('[FAQ]',             RESEED, 0);
DBCC CHECKIDENT ('[BaiViet]',         RESEED, 0);
DBCC CHECKIDENT ('[Banner]',          RESEED, 0);


-- ============================================================
-- BƯỚC 4: TaiKhoan (18 tài khoản)
-- ============================================================
SET IDENTITY_INSERT [TaiKhoan] ON;
INSERT [TaiKhoan] ([IDTaiKhoan], [TenDangNhap], [MatKhau], [Email], [HoTenNguoiDung], [TrangThaiTaiKhoan], [LoaiTK])
VALUES
(1,  'admin',          '$2b$10$gRrNISI6AFST1mosCCYfKukJjcue1QA5GP93IrXU14DxlojIwHeAW', 'admin@voucherhub.com',          N'System Admin',             N'Hoạt động', N'Admin'),
(2,  'highlands',      '$2b$10$D2Mi8iSYRMjrLqDkQGD9g.oObFjOgJlEVyMSosjTNWxRtAkJAqyLe', 'highlands@voucherhub.com',      N'Highlands Coffee',         N'Hoạt động', N'DoiTac'),
(3,  'cgv',            '$2b$10$df3WZ7KHiRboWc4w7HBwpe/xORhUDQPeRZoBEteDBzTLB45Nt5ntS', 'cgv@voucherhub.com',            N'CGV Cinemas',              N'Hoạt động', N'DoiTac'),
(4,  'phuclong',       '$2b$10$NuBzEiSBPT6ALWpUCXhCzurtCerKPr9Y3kQdAZnLRUNTpla8GGn9S', 'phuclong@voucherhub.com',       N'Phúc Long Coffee & Tea',   N'Hoạt động', N'DoiTac'),
(5,  'highlands_emp1', '$2b$10$qIbWfJ2fNYYbYi6sSiMqy.XetJAfAahMOCmKjJYHMAkIsVPerncxa', 'highlands_emp1@voucherhub.com', N'Highlands Nhân viên 1',    N'Hoạt động', N'DoiTac'),
(6,  'highlands_emp2', '$2b$10$zN4QoVsTZ8QV7vDhEsVfyOFprMBe.rFG0oolg9ak.ha4kx1GGEjRW', 'highlands_emp2@voucherhub.com', N'Highlands Nhân viên 2',    N'Hoạt động', N'DoiTac'),
(7,  'highlands_emp3', '$2b$10$owCqfK9/EW/rIwAlosHMzeXqhuo/GVkWNsd.KXn0Ozj3zntyOKoR2', 'highlands_emp3@voucherhub.com', N'Highlands Nhân viên 3',    N'Hoạt động', N'DoiTac'),
(8,  'cgv_emp1',       '$2b$10$.dP3P.umnylegMKUVzL72.69Nd4mAFqjv8nrT4EQW.Ywrj1lOofGW', 'cgv_emp1@voucherhub.com',       N'CGV Nhân viên 1',          N'Hoạt động', N'DoiTac'),
(9,  'cgv_emp2',       '$2b$10$hoP7ODssj6XpYu0vgGe8P.EaV1Lxuf9PaOtYa2PaYrUQWQAtIwQLu', 'cgv_emp2@voucherhub.com',       N'CGV Nhân viên 2',          N'Hoạt động', N'DoiTac'),
(10, 'cgv_emp3',       '$2b$10$/RmeVUXrX2LfDg93x29sv.5HEKJLHXVqADNgKd2G.oc4biPipN0U2', 'cgv_emp3@voucherhub.com',       N'CGV Nhân viên 3',          N'Hoạt động', N'DoiTac'),
(11, 'phuclong_emp1',  '$2b$10$YG20QiSI/ueZAugsuHxTee8uuIYjrmUwD01.6kYODaxq7VtgQnZ8C', 'phuclong_emp1@voucherhub.com',  N'Phúc Long Nhân viên 1',   N'Hoạt động', N'DoiTac'),
(12, 'phuclong_emp2',  '$2b$10$38ykfYA9Dw1SY5LcU4KrEOT7m7dpJYkvqCyt2qjsv7Mv7mko/5986', 'phuclong_emp2@voucherhub.com',  N'Phúc Long Nhân viên 2',   N'Hoạt động', N'DoiTac'),
(13, 'phuclong_emp3',  '$2b$10$O73zRtQGdHgsRk7oOMhw/uKYWV16HsjyJ7QgdDhMayK1pYScqrTH6', 'phuclong_emp3@voucherhub.com',  N'Phúc Long Nhân viên 3',   N'Hoạt động', N'DoiTac'),
(14, 'customer1',      '$2b$10$fAMfcGtSNFmCII.KCf3ku.9d0dk9MALNqBCWLR.YMkUkDF0l6yT.S', 'customer1@gmail.com',           N'Nguyễn Văn Một',           N'Hoạt động', N'KhachHang'),
(15, 'customer2',      '$2b$10$f5NxIwo5l83XuqN9c8yFheChpSjndc/oLbSp6btC.d7jFk9SH0vFO', 'customer2@gmail.com',           N'Trần Thị Hai',             N'Hoạt động', N'KhachHang'),
(16, 'customer3',      '$2b$10$sBKFESFbI4rRDHqx3EP1Aeork/O/C8VP/BuIIzA6ok5Ow89YnpQr6', 'customer3@gmail.com',           N'Lê Văn Ba',                N'Hoạt động', N'KhachHang'),
(17, 'customer4',      '$2b$10$QMckUWcugPsWCb17LoqPP.AMcLrF2vyQcCm7rqjbMUG5wBbwbWfj.', 'customer4@gmail.com',           N'Phạm Thị Bốn',             N'Hoạt động', N'KhachHang'),
(18, 'customer5',      '$2b$10$0fZ42xlw1RGnr9je3jXXQODFUIw4iCz4antTR5nNpX7.RfOLd1Ubm', 'customer5@gmail.com',           N'Hoàng Văn Năm',            N'Hoạt động', N'KhachHang');
SET IDENTITY_INSERT [TaiKhoan] OFF;


-- ============================================================
-- BƯỚC 5: Admin
-- ============================================================
INSERT [Admin] ([SDT_Admin], [IDTaiKhoan])
VALUES ('0987654321', 1);


-- ============================================================
-- BƯỚC 6: DoiTac
-- Chuẩn hóa GioMoCua/GioDongCua theo định dạng 'hh:mm:ss' để tương
-- thích hoàn toàn với kiểu TIME trong SQL Server (tránh convert lỗi).
-- ============================================================
SET IDENTITY_INSERT [DoiTac] ON;
INSERT [DoiTac] ([MaDoiTac], [TenDoanhNghiep], [MaSoThue], [CaNhanDaiDien], [LinhVucKinhDoanh], [TrangThai], [MoTa], [EmailLienHe], [SDTLienHe], [GioMoCua], [GioDongCua], [Website], [DiaChiTruSo], [SDTDaiDien], [EmailDaiDien], [AvatarUrl])
VALUES
(1, N'Highlands Coffee', '0312345678', N'Lê Hoàng Diệp', N'F&B',    N'Hoạt động',
    N'Thương hiệu cà phê hàng đầu Việt Nam, mang hương vị truyền thống đến mọi người.',
    'highlands@voucherhub.com', '0281900125',
    '07:00:00', '23:00:00',
    'https://highlandscoffee.com.vn', N'135/37/50 Nguyễn Hữu Cảnh, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
    '0901234567', 'hoangdieple@highlands.com.vn', '/uploads/avatar/partner/partner_1_highlands-coffee.jpg'),
(2, N'CGV Cinemas',      '0387654321', N'Sim Joon Woo',   N'Giải trí', N'Hoạt động',
    N'Hệ thống rạp chiếu phim hiện đại lớn nhất Việt Nam.',
    'cgv@voucherhub.com', '0281900601',
    '08:30:00', '23:30:00',
    'https://cgv.vn', N'Tầng 5, Landmark 81, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh',
    '0912345678', 'joonwoo.sim@cgv.vn', '/uploads/avatar/partner/partner_2_cgv-cinemas.jpg'),
(3, N'Phúc Long',        '0399887766', N'Lâm Chấn Huy',  N'F&B',    N'Hoạt động',
    N'Thương hiệu trà sữa và cà phê chất lượng cao được giới trẻ vô cùng ưa chuộng.',
    'phuclong@voucherhub.com', '0281800688',
    '08:00:00', '22:30:00',
    'https://phuclong.com.vn', N'42/24 Lý Tự Trọng, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    '0923456789', 'chanhuy.lam@phuclong.com.vn', '/uploads/avatar/partner/partner_3_phuc-long.jpg');
SET IDENTITY_INSERT [DoiTac] OFF;


-- ============================================================
-- BƯỚC 7: NhanVienDoiTac
-- ============================================================
SET IDENTITY_INSERT [NhanVienDoiTac] ON;
INSERT [NhanVienDoiTac] ([IDNhanVien], [IDTaiKhoan], [MaDoiTac], [ChucVu])
VALUES
(1,  5,  1, N'Quản lý cửa hàng'),
(2,  6,  1, N'Nhân viên bán hàng'),
(3,  7,  1, N'Trưởng nhóm ca'),
(4,  8,  2, N'Quản lý cụm rạp'),
(5,  9,  2, N'Nhân viên phòng vé'),
(6,  10, 2, N'Trưởng ca rạp'),
(7,  11, 3, N'Quản lý chi nhánh'),
(8,  12, 3, N'Nhân viên pha chế'),
(9,  13, 3, N'Trưởng nhóm'),
(10, 2,  1, N'Đại diện doanh nghiệp'),
(11, 3,  2, N'Đại diện doanh nghiệp'),
(12, 4,  3, N'Đại diện doanh nghiệp');
SET IDENTITY_INSERT [NhanVienDoiTac] OFF;


-- ============================================================
-- BƯỚC 8: KhachHang
-- ============================================================
INSERT [KhachHang] ([SDT_KH], [IDTaiKhoan], [NgaySinh], [GioiTinh], [DiaChiKhachHang])
VALUES
('0911223344', 14, '1995-05-15', N'Nam', N'12 Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh'),
('0922334455', 15, '1998-09-20', N'Nữ', N'456 Lê Lợi, Quận Gò Vấp, TP. Hồ Chí Minh'),
('0933445566', 16, '2000-01-01', N'Nam', N'789 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'),
('0944556677', 17, '1992-12-10', N'Nữ', N'15 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh'),
('0955667788', 18, '1997-07-07', N'Nam', N'22 Điện Biên Phủ, Q. Bình Thạnh, TP. Hồ Chí Minh');


-- ============================================================
-- BƯỚC 9: ChiNhanh
-- ============================================================
SET IDENTITY_INSERT [ChiNhanh] ON;
INSERT [ChiNhanh] ([MaChiNhanh], [TenChiNhanh], [SDT_CN], [DiaChiChiNhanh], [MaDoiTac])
VALUES
-- Highlands (MaDoiTac: 1)
(1,  N'Highlands Coffee Landmark 81',   '0287300811', N'Tầng trệt, Landmark 81, Bình Thạnh',                     1),
(2,  N'Highlands Coffee Nguyễn Du',     '0287300812', N'85 Nguyễn Du, P. Bến Nghé, Quận 1',                      1),
(3,  N'Highlands Coffee Bến Thành',     '0287300813', N'135 Phan Chu Trinh, P. Bến Thành, Quận 1',               1),
(4,  N'Highlands Coffee Crescent Mall', '0287300814', N'Tầng trệt, Crescent Mall, Quận 7',                       1),
-- CGV (MaDoiTac: 2)
(5,  N'CGV Vincom Center Đồng Khởi',   '0283936900', N'Tầng 3, Vincom Center, 72 Lê Thánh Tôn, Quận 1',        2),
(6,  N'CGV Crescent Mall',             '0285413333', N'Tầng 5, Crescent Mall, Quận 7',                           2),
(7,  N'CGV Aeon Mall Bình Tân',        '0286288773', N'Tầng 3, Aeon Mall Bình Tân, Bình Tân',                    2),
-- Phúc Long (MaDoiTac: 3)
(8,  N'Phúc Long Ngô Đức Kế',         '0283822833', N'63 Ngô Đức Kế, Quận 1',                                   3),
(9,  N'Phúc Long Lý Tự Trọng',        '0283825883', N'325 Lý Tự Trọng, Quận 1',                                 3),
(10, N'Phúc Long Landmark 81',         '0283620883', N'Tầng B1, Landmark 81, Bình Thạnh',                        3),
(11, N'Phúc Long Crescent Mall',       '0285413883', N'Tầng 4, Crescent Mall, Quận 7',                           3);
SET IDENTITY_INSERT [ChiNhanh] OFF;


-- ============================================================
-- BƯỚC 10: DanhMuc
-- ============================================================
SET IDENTITY_INSERT [DanhMuc] ON;
INSERT [DanhMuc] ([MaDanhMuc], [TenDanhMuc], [MoTa])
VALUES
(1, N'Ẩm thực',  N'Ăn uống, Cà phê, Trà sữa, Nhà hàng'),
(2, N'Giải trí', N'Rạp chiếu phim, Vui chơi, Sự kiện'),
(3, N'Mua sắm',  N'Thời trang, Mỹ phẩm, Siêu thị'),
(4, N'Dịch vụ',  N'Spa, Làm đẹp, Giáo dục, Sức khỏe');
SET IDENTITY_INSERT [DanhMuc] OFF;


-- ============================================================
-- BƯỚC 11: Voucher (16 voucher)
--
-- ĐÃ SỬA:
--   Voucher 1: SoLuongDaBan sửa từ 7 -> 6 (cho khớp với tổng SoLuongMua từ các đơn hoàn tất: 1, 13, 16, 17).
--   Voucher 12: SoLuongDaBan sửa từ 1 -> 2 (đơn 7 + đơn 5 đã hoàn tiền).
--   Voucher 14: SoLuongDaBan sửa từ 3 -> 4 (đơn 11 + đơn 5 + đơn 15 đã hoàn tiền).
-- ============================================================
SET IDENTITY_INSERT [Voucher] ON;
INSERT [Voucher] ([VoucherID], [MaDanhMuc], [MaDoiTac], [TenVoucher], [MoTaVoucher], [MoTaDieuKien],
                  [GiaGoc], [GiaBan], [ThoiGianBatDau], [ThoiGianKetThuc],
                  [ThoiGianBatDauBan], [ThoiGianKetThucBan],
                  [SoLuongChoPhep], [SoLuongDaBan], [TrangThaiVoucher],
                  [ChinhSachHoanTien], [HuongDanSuDung], [ImageUrl])
VALUES
-- Highlands (MaDoiTac: 1)
(1,  1, 1, N'E-Voucher Highlands Coffee 50k',
    N'Áp dụng mua nước và bánh tại hệ thống Highlands Coffee toàn quốc.',
    N'Mỗi hóa đơn chỉ áp dụng 1 voucher. Không áp dụng chung khuyến mãi khác.',
    50000, 45000, '2026-01-01 00:00:00', '2026-06-01 23:59:59', '2026-01-01 00:00:00', '2026-06-01 23:59:59',
    1000, 6, N'Đang hoạt động',
    N'Voucher không có giá trị quy đổi thành tiền mặt. Không hoàn trả tiền thừa.',
    N'Đưa mã voucher cho nhân viên thu ngân quét khi thanh toán.',
    '/uploads/vouchers/partner_1_highlands-coffee/highlands_50k.jpg'),

(2,  1, 1, N'Combo 2 Cà Phê Sữa Đá Size M',
    N'Thưởng thức combo 2 ly cà phê sữa đá truyền thống đậm đà.',
    N'Chỉ áp dụng cho size M. Có thể bù thêm tiền để up size L.',
    78000, 59000, '2026-02-01 00:00:00', '2026-08-31 23:59:59', '2026-02-01 00:00:00', '2026-08-31 23:59:59',
    500, 1, N'Đang hoạt động',
    N'Không hoàn tiền sau khi mua.',
    N'Xuất trình e-voucher cho nhân viên tại quầy order.',
    '/uploads/vouchers/partner_1_highlands-coffee/highlands_combo.jpg'),

(3,  1, 1, N'Giảm 20k Cho Hóa Đơn Freeze Trà Xanh',
    N'Khuyến mãi đặc biệt dành riêng cho dòng sản phẩm Freeze Trà Xanh.',
    N'Áp dụng cho hóa đơn từ 65k có chứa Freeze Trà Xanh.',
    20000, 2000, '2026-03-01 00:00:00', '2026-09-30 23:59:59', '2026-03-01 00:00:00', '2026-09-30 23:59:59',
    300, 0, N'Đang hoạt động',
    N'Không đổi trả.',
    N'Quét mã vạch khi thanh toán.',
    '/uploads/vouchers/partner_1_highlands-coffee/highlands_freeze.jpg'),

(4,  1, 1, N'Voucher Highlands 100k (Chờ Duyệt)',
    N'Phiếu quà tặng điện tử mua sắm sản phẩm ăn uống tại Highlands.',
    N'Áp dụng toàn quốc.',
    100000, 90000, '2026-06-01 00:00:00', '2026-12-31 23:59:59', '2026-06-01 00:00:00', '2026-12-31 23:59:59',
    200, 0, N'Chờ duyệt',
    N'Không hoàn tiền.',
    N'Quét mã thanh toán.',
    '/uploads/vouchers/partner_1_highlands-coffee/highlands_100k.jpg'),

(5,  1, 1, N'Voucher Mua 1 Tặng 1 Trà Sen Vàng',
    N'Mua 1 Trà Sen Vàng size L tặng 1 ly cùng size hoặc nhỏ hơn.',
    N'Chỉ áp dụng khung giờ 14h - 18h hàng ngày.',
    45000, 10000, '2026-01-01 00:00:00', '2026-10-31 23:59:59', '2026-01-01 00:00:00', '2026-10-31 23:59:59',
    400, 0, N'Tạm ngưng',
    N'Không hoàn tiền.',
    N'Đưa nhân viên quét mã trước khi in bill.',
    '/uploads/vouchers/partner_1_highlands-coffee/highlands_m1t1.jpg'),

(6,  1, 1, N'Voucher Mới Nháp Highlands',
    N'Mô tả nháp.',
    N'Điều kiện nháp.',
    50000, 40000, '2026-06-01 00:00:00', '2026-12-31 23:59:59', '2026-06-01 00:00:00', '2026-12-31 23:59:59',
    100, 0, N'Bản nháp',
    N'Không hoàn tiền.',
    N'Không có.',
    '/uploads/vouchers/partner_1_highlands-coffee/highlands_draft.jpg'),

-- CGV Cinemas (MaDoiTac: 2)
(7,  2, 2, N'Vé Xem Phim 2D CGV Toàn Quốc',
    N'Đổi 1 vé xem phim định dạng 2D tại tất cả các rạp CGV.',
    N'Chỉ áp dụng cho phim 2D, ghế thường/VIP. Không áp dụng suất chiếu đặc biệt.',
    110000, 85000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', '2026-01-01 00:00:00', '2026-12-31 23:59:59',
    2000, 2, N'Đang hoạt động',
    N'Vé đã mua miễn đổi trả.',
    N'Nhập mã code trên app CGV hoặc đưa trực tiếp tại quầy vé.',
    '/uploads/vouchers/partner_2_cgv-cinemas/cgv_2d.jpg'),

(8,  2, 2, N'Combo CGV 1 Bắp + 2 Nước Ngọt',
    N'Combo bắp ngọt size L và 2 nước ngọt size M.',
    N'Đổi tại quầy bắp nước của CGV.',
    115000, 89000, '2026-02-01 00:00:00', '2026-11-30 23:59:59', '2026-02-01 00:00:00', '2026-11-30 23:59:59',
    1000, 0, N'Đang hoạt động',
    N'Không hoàn tiền.',
    N'Quét mã tại quầy nhận bắp nước.',
    '/uploads/vouchers/partner_2_cgv-cinemas/cgv_combo.jpg'),

(9,  2, 2, N'Voucher Giảm 50k Vé IMAX',
    N'Giảm trực tiếp 50k khi mua vé xem phim phòng chiếu IMAX.',
    N'Áp dụng cho mọi suất chiếu IMAX.',
    50000, 10000, '2026-03-01 00:00:00', '2026-12-31 23:59:59', '2026-03-01 00:00:00', '2026-12-31 23:59:59',
    500, 0, N'Chờ duyệt',
    N'Không hoàn tiền.',
    N'Áp dụng khi book vé online trên App.',
    '/uploads/vouchers/partner_2_cgv-cinemas/cgv_imax.jpg'),

(10, 2, 2, N'Combo Cặp Đôi CGV Sweetbox',
    N'2 vé xem phim ghế đôi Sweetbox và 1 combo bắp nước lớn.',
    N'Áp dụng cho ghế Sweetbox.',
    320000, 260000, '2026-01-01 00:00:00', '2026-08-31 23:59:59', '2026-01-01 00:00:00', '2026-08-31 23:59:59',
    300, 0, N'Tạm ngưng',
    N'Không hoàn trả.',
    N'Quét mã tại quầy vé.',
    '/uploads/vouchers/partner_2_cgv-cinemas/cgv_sweetbox.jpg'),

(11, 2, 2, N'Voucher CGV Nháp',
    N'Bản nháp voucher CGV.',
    N'Điều kiện nháp.',
    100000, 80000, '2026-06-01 00:00:00', '2026-12-31 23:59:59', '2026-06-01 00:00:00', '2026-12-31 23:59:59',
    50, 0, N'Bản nháp',
    N'Không.',
    N'Không.',
    '/uploads/vouchers/partner_2_cgv-cinemas/cgv_draft.jpg'),

-- Phúc Long (MaDoiTac: 3)
(12, 1, 3, N'E-Voucher Phúc Long Trị Giá 50k',
    N'Phiếu mua hàng điện tử thanh toán nước/bánh tại Phúc Long.',
    N'Hóa đơn phải lớn hơn hoặc bằng giá trị voucher.',
    50000, 46000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', '2026-01-01 00:00:00', '2026-12-31 23:59:59',
    1500, 2, N'Đang hoạt động',
    N'Voucher không quy đổi thành tiền mặt.',
    N'Đưa cho nhân viên quầy thu ngân quét khi thanh toán.',
    '/uploads/vouchers/partner_3_phuc-long/phuclong_50k.jpg'),

(13, 1, 3, N'Voucher Trà Đào Sữa Size L 35k',
    N'Thưởng thức dòng Trà Đào Sữa trứ danh của Phúc Long size L.',
    N'Chỉ áp dụng cho món Trà đào sữa ly size L.',
    55000, 35000, '2026-02-01 00:00:00', '2026-10-31 23:59:59', '2026-02-01 00:00:00', '2026-10-31 23:59:59',
    800, 2, N'Đang hoạt động',
    N'Không hoàn tiền.',
    N'Cung cấp mã cho thu ngân trước khi gọi món.',
    '/uploads/vouchers/partner_3_phuc-long/phuclong_tradaosua.jpg'),

(14, 1, 3, N'Voucher Phúc Long 100k',
    N'Mã giảm giá mua sắm sản phẩm của hệ thống Phúc Long.',
    N'Không tách hóa đơn để hưởng nhiều voucher.',
    100000, 92000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', '2026-01-01 00:00:00', '2026-12-31 23:59:59',
    600, 4, N'Đang hoạt động',
    N'Không hoàn tiền thừa.',
    N'Quét mã tại quầy thanh toán.',
    '/uploads/vouchers/partner_3_phuc-long/phuclong_100k.jpg'),

(15, 1, 3, N'Voucher Phúc Long Chờ Duyệt',
    N'Khuyến mãi đặc biệt giảm 20% tổng hóa đơn nước.',
    N'Áp dụng hóa đơn dưới 500k.',
    50000, 40000, '2026-06-01 00:00:00', '2026-12-31 23:59:59', '2026-06-01 00:00:00', '2026-12-31 23:59:59',
    200, 0, N'Chờ duyệt',
    N'Không hoàn trả.',
    N'Quét mã vạch.',
    '/uploads/vouchers/partner_3_phuc-long/phuclong_pending.jpg'),

(16, 1, 3, N'Voucher Phúc Long Nháp',
    N'Bản nháp của Phúc Long.',
    N'Điều kiện nháp.',
    50000, 45000, '2026-06-01 00:00:00', '2026-12-31 23:59:59', '2026-06-01 00:00:00', '2026-12-31 23:59:59',
    100, 0, N'Bản nháp',
    N'Không.',
    N'Không.',
    '/uploads/vouchers/partner_3_phuc-long/phuclong_draft.jpg');
SET IDENTITY_INSERT [Voucher] OFF;


-- ============================================================
-- BƯỚC 12: Voucher_ChiNhanh (đầy đủ tất cả voucher đang hoạt động/tạm ngưng)
-- Quy tắc:
--   Voucher Đang hoạt động  -> TrangThaiApDung = 'Đang áp dụng'
--   Voucher Tạm ngưng       -> TrangThaiApDung = 'Tạm ngưng'
--   Voucher Chờ duyệt/Nháp  -> không tạo dòng (chưa được duyệt)
-- ============================================================
SET IDENTITY_INSERT [Voucher_ChiNhanh] ON;
INSERT [Voucher_ChiNhanh] ([STT], [VoucherID], [MaChiNhanh], [TrangThaiApDung])
VALUES
-- Voucher 1 (Highlands 50k - Đang hoạt động) -> 4 chi nhánh Highlands
(1,  1, 1, N'Đang áp dụng'),
(2,  1, 2, N'Đang áp dụng'),
(3,  1, 3, N'Đang áp dụng'),
(4,  1, 4, N'Đang áp dụng'),

-- Voucher 2 (Highlands Combo sữa đá - Đang hoạt động) -> 4 chi nhánh Highlands
(5,  2, 1, N'Đang áp dụng'),
(6,  2, 2, N'Đang áp dụng'),
(7,  2, 3, N'Đang áp dụng'),
(8,  2, 4, N'Đang áp dụng'),

-- Voucher 3 (Highlands Freeze Trà Xanh - Đang hoạt động) -> 4 chi nhánh Highlands
(9,  3, 1, N'Đang áp dụng'),
(10, 3, 2, N'Đang áp dụng'),
(11, 3, 3, N'Đang áp dụng'),
(12, 3, 4, N'Đang áp dụng'),

-- Voucher 5 (Highlands M1T1 Trà Sen Vàng - Tạm ngưng) -> 4 chi nhánh Highlands
(13, 5, 1, N'Tạm ngưng'),
(14, 5, 2, N'Tạm ngưng'),
(15, 5, 3, N'Tạm ngưng'),
(16, 5, 4, N'Tạm ngưng'),

-- Voucher 7 (CGV 2D - Đang hoạt động) -> 3 chi nhánh CGV
(17, 7, 5, N'Đang áp dụng'),
(18, 7, 6, N'Đang áp dụng'),
(19, 7, 7, N'Đang áp dụng'),

-- Voucher 8 (CGV Combo bắp - Đang hoạt động) -> 3 chi nhánh CGV
(20, 8, 5, N'Đang áp dụng'),
(21, 8, 6, N'Đang áp dụng'),
(22, 8, 7, N'Đang áp dụng'),

-- Voucher 10 (CGV Sweetbox - Tạm ngưng) -> 3 chi nhánh CGV
(23, 10, 5, N'Tạm ngưng'),
(24, 10, 6, N'Tạm ngưng'),
(25, 10, 7, N'Tạm ngưng'),

-- Voucher 12 (Phúc Long 50k - Đang hoạt động) -> 4 chi nhánh Phúc Long
(26, 12, 8,  N'Đang áp dụng'),
(27, 12, 9,  N'Đang áp dụng'),
(28, 12, 10, N'Đang áp dụng'),
(29, 12, 11, N'Đang áp dụng'),

-- Voucher 13 (Phúc Long Trà Đào Sữa - Đang hoạt động) -> 4 chi nhánh Phúc Long
(30, 13, 8,  N'Đang áp dụng'),
(31, 13, 9,  N'Đang áp dụng'),
(32, 13, 10, N'Đang áp dụng'),
(33, 13, 11, N'Đang áp dụng'),

-- Voucher 14 (Phúc Long 100k - Đang hoạt động) -> 4 chi nhánh Phúc Long
(34, 14, 8,  N'Đang áp dụng'),
(35, 14, 9,  N'Đang áp dụng'),
(36, 14, 10, N'Đang áp dụng'),
(37, 14, 11, N'Đang áp dụng');
SET IDENTITY_INSERT [Voucher_ChiNhanh] OFF;


-- ============================================================
-- BƯỚC 13: DonHang (17 đơn hàng)
-- ============================================================
SET IDENTITY_INSERT [DonHang] ON;
INSERT [DonHang] ([MaDonHang], [IDTaiKhoan], [ThoiGianThanhToan], [TongTien], [PhuongThucThanhToan], [TrangThaiDonHang], [TrangThaiThanhToan])
VALUES
-- customer1 (IDTaiKhoan=14)
(1,  14, '2026-05-10 10:00:00', 90000,  N'Thẻ quốc tế',      N'Hoàn tất',        N'Đã thanh toán'),
(2,  14, '2026-05-15 14:30:00', 59000,  N'Ví điện tử',        N'Hoàn tất',        N'Đã thanh toán'),
(3,  14, NULL,                  85000,  N'Ví điện tử',        N'Chờ xử lý',       N'Chưa thanh toán'),
(4,  14, NULL,                  46000,  N'Thẻ ATM nội địa',   N'Đã hủy',          N'Chưa thanh toán'),
(5,  14, '2026-05-20 09:15:00', 138000, N'Ví điện tử',        N'Đã hủy',          N'Đã hoàn tiền'),

-- customer2 (IDTaiKhoan=15)
(6,  15, '2026-05-11 11:20:00', 170000, N'Thẻ quốc tế',      N'Hoàn tất',        N'Đã thanh toán'),
(7,  15, '2026-05-16 16:40:00', 46000,  N'Ví điện tử',        N'Hoàn tất',        N'Đã thanh toán'),
(8,  15, NULL,                  89000,  N'Ví điện tử',        N'Chờ xử lý',       N'Chưa thanh toán'),
(9,  15, NULL,                  35000,  N'Thẻ ATM',           N'Đã hủy',          N'Chưa thanh toán'),

-- customer3 (IDTaiKhoan=16)
(10, 16, '2026-05-12 15:10:00', 70000,  N'Ví điện tử',        N'Hoàn tất',        N'Đã thanh toán'),
(11, 16, '2026-05-18 10:05:00', 184000, N'Thẻ quốc tế',      N'Hoàn tất',        N'Đã thanh toán'),
(12, 16, NULL,                  45000,  N'Ví điện tử',        N'Chờ xử lý',       N'Chưa thanh toán'),

-- customer4 (IDTaiKhoan=17)
(13, 17, '2026-05-14 09:00:00', 45000,  N'Thẻ quốc tế',      N'Hoàn tất',        N'Đã thanh toán'),
(14, 17, NULL,                  89000,  N'Thẻ ATM',           N'Đã hủy',          N'Chưa thanh toán'),
(15, 17, '2026-05-25 11:30:00', 92000,  N'Ví điện tử',        N'Đã hủy',          N'Đã hoàn tiền'),

-- customer5 (IDTaiKhoan=18) - 2 đơn mới để chứa MaVoucher cho 3 mã test
(16, 18, '2026-05-28 10:00:00', 45000,  N'Ví điện tử',        N'Hoàn tất',        N'Đã thanh toán'),   -- cho TESTVALID1
(17, 18, '2026-05-01 14:00:00', 90000,  N'Thẻ quốc tế',      N'Hoàn tất',        N'Đã thanh toán');   -- cho TESTUSED12 + TESTEXPIRE
SET IDENTITY_INSERT [DonHang] OFF;


-- ============================================================
-- BƯỚC 14: ChiTietDonHang (19 dòng)
-- ============================================================
SET IDENTITY_INSERT [ChiTietDonHang] ON;
INSERT [ChiTietDonHang] ([MaCTDonHang], [MaDonHang], [VoucherID], [SoLuongMua], [DonGia], [ThanhTien])
VALUES
-- Đơn 1 (Hoàn tất): 2x Highlands 50k
(1,  1,  1,  2, 45000, 90000),
-- Đơn 2 (Hoàn tất): 1x Highlands Combo sữa đá
(2,  2,  2,  1, 59000, 59000),
-- Đơn 3 (Chờ thanh toán): 1x CGV 2D
(3,  3,  7,  1, 85000, 85000),
-- Đơn 4 (Đã hủy): 1x Phúc Long 50k
(4,  4,  12, 1, 46000, 46000),
-- Đơn 5 (Đã hoàn tiền): 1x Phúc Long 100k + 1x Phúc Long 50k
(5,  5,  14, 1, 92000, 92000),
(6,  5,  12, 1, 46000, 46000),

-- Đơn 6 (Hoàn tất): 2x CGV 2D
(7,  6,  7,  2, 85000, 170000),
-- Đơn 7 (Hoàn tất): 1x Phúc Long 50k
(8,  7,  12, 1, 46000, 46000),
-- Đơn 8 (Chờ thanh toán): 1x CGV Combo bắp
(9,  8,  8,  1, 89000, 89000),
-- Đơn 9 (Đã hủy): 1x Phúc Long Trà Đào Sữa
(10, 9,  13, 1, 35000, 35000),

-- Đơn 10 (Hoàn tất): 2x Phúc Long Trà Đào Sữa
(11, 10, 13, 2, 35000, 70000),
-- Đơn 11 (Hoàn tất): 2x Phúc Long 100k
(12, 11, 14, 2, 92000, 184000),
-- Đơn 12 (Chờ thanh toán): 1x Highlands 50k
(13, 12, 1,  1, 45000, 45000),

-- Đơn 13 (Hoàn tất): 1x Highlands 50k
(14, 13, 1,  1, 45000, 45000),
-- Đơn 14 (Đã hủy): 1x CGV Combo bắp
(15, 14, 8,  1, 89000, 89000),
-- Đơn 15 (Đã hoàn tiền): 1x Phúc Long 100k
(16, 15, 14, 1, 92000, 92000),

-- Đơn 16 (Hoàn tất - customer5): 1x Highlands 50k -> MaCTDH cho TESTVALID1
(17, 16, 1,  1, 45000, 45000),
-- Đơn 17 (Hoàn tất - customer5): 2x Highlands 50k -> MaCTDH cho TESTUSED12 + TESTEXPIRE
(18, 17, 1,  1, 45000, 45000),
(19, 17, 1,  1, 45000, 45000);
SET IDENTITY_INSERT [ChiTietDonHang] OFF;


-- ============================================================
-- BƯỚC 15: MaVoucher
-- ============================================================
INSERT [MaVoucher] ([SoMaVoucher], [MaCTDonHang], [TrangThaiSuDung], [ThoiDiemPhatHanh], [ThoiDiemSuDung], [MaChiNhanhSuDung])
VALUES
-- ===== 3 mã test giao diện bắt buộc =====
('TESTVALID1', 17, N'Chưa sử dụng', '2026-05-28 10:00:00', NULL,                    NULL),
('TESTUSED12', 18, N'Đã sử dụng',   '2026-05-01 14:00:00', '2026-05-02 11:00:00',   1),
('TESTEXPIRE', 19, N'Hết hạn',      '2026-05-01 14:00:00', NULL,                    NULL),

-- ===== Đơn 1 (Hoàn tất): 2x Highlands 50k - MaCTDH=1 =====
('HL50K9X2J1', 1, N'Chưa sử dụng', '2026-05-10 10:00:00', NULL,                    NULL),
('HL50K8W7V2', 1, N'Đã sử dụng',   '2026-05-10 10:00:00', '2026-05-11 09:30:00',   2),

-- ===== Đơn 2 (Hoàn tất): 1x Highlands Combo - MaCTDH=2 =====
('HLSDCombo1', 2, N'Chưa sử dụng', '2026-05-15 14:30:00', NULL,                    NULL),

-- ===== Đơn 6 (Hoàn tất): 2x CGV 2D - MaCTDH=7 =====
('CGV2D93K8J', 7, N'Đã sử dụng',   '2026-05-11 11:20:00', '2026-05-14 20:00:00',   5),
('CGV2DJ8F2D', 7, N'Chưa sử dụng', '2026-05-11 11:20:00', NULL,                    NULL),

-- ===== Đơn 7 (Hoàn tất): 1x Phúc Long 50k - MaCTDH=8 =====
('PL50K82J1W', 8, N'Chưa sử dụng', '2026-05-16 16:40:00', NULL,                    NULL),

-- ===== Đơn 10 (Hoàn tất): 2x Phúc Long Trà Đào Sữa - MaCTDH=11 =====
('PLTDSSZ9K1', 11, N'Chưa sử dụng', '2026-05-12 15:10:00', NULL,                   NULL),
('PLTDSSZ9K2', 11, N'Đã sử dụng',   '2026-05-12 15:10:00', '2026-05-13 14:20:00',  8),

-- ===== Đơn 11 (Hoàn tất): 2x Phúc Long 100k - MaCTDH=12 =====
('PL100K92H1', 12, N'Chưa sử dụng', '2026-05-18 10:05:00', NULL,                   NULL),
('PL100K92H2', 12, N'Chưa sử dụng', '2026-05-18 10:05:00', NULL,                   NULL),

-- ===== Đơn 13 (Hoàn tất): 1x Highlands 50k - MaCTDH=14 =====
('HL50K8W7V9', 14, N'Chưa sử dụng', '2026-05-14 09:00:00', NULL,                   NULL),

-- ===== Đơn 5 (Đã hoàn tiền): phát mã nhưng đánh dấu trạng thái hoàn tiền =====
-- Đơn 5 dòng 1: 1x Phúc Long 100k - MaCTDH=5
('PL100KREF1', 5,  N'Đã sử dụng',   '2026-05-20 09:15:00', '2026-05-22 10:00:00',  9),
-- Đơn 5 dòng 2: 1x Phúc Long 50k - MaCTDH=6
('PL50KREF01', 6,  N'Đã sử dụng',   '2026-05-20 09:15:00', '2026-05-22 10:05:00',  9),

-- ===== Đơn 15 (Đã hoàn tiền): 1x Phúc Long 100k - MaCTDH=16 =====
('PL100KREF2', 16, N'Đã sử dụng',   '2026-05-25 11:30:00', '2026-05-27 14:00:00',  10);


-- ============================================================
-- BƯỚC 16: GioHang & ChiTietGioHang
-- ============================================================
SET IDENTITY_INSERT [GioHang] ON;
INSERT [GioHang] ([MaGioHang], [IDTaiKhoan], [ThoiGianTao])
VALUES
(1, 14, '2026-06-01 09:00:00'),
(2, 15, '2026-06-02 10:30:00');
SET IDENTITY_INSERT [GioHang] OFF;

SET IDENTITY_INSERT [ChiTietGioHang] ON;
INSERT [ChiTietGioHang] ([MaCTGioHang], [MaGioHang], [VoucherID], [SoLuong])
VALUES
(1, 1, 7,  1),   -- customer1: 1x Vé CGV 2D (85k)
(2, 1, 12, 2),   -- customer1: 2x Phúc Long 50k (46k x2)
(3, 2, 1,  1);   -- customer2: 1x Highlands 50k (45k)
SET IDENTITY_INSERT [ChiTietGioHang] OFF;


-- ============================================================
-- BƯỚC 17: DanhGia
-- ============================================================
SET IDENTITY_INSERT [DanhGia] ON;
INSERT [DanhGia] ([MaDanhGia], [VoucherID], [IDTaiKhoan], [DiemDanhGia], [NoiDung], [NgayDanhGia], [PhanHoiXuLy])
VALUES
(1, 1,  14, 5, N'Cà phê Highlands ngon đậm đà, voucher mua rất hời, quét mã cực nhanh tại Landmark 81!',
    '2026-05-13 10:00:00', N'Cảm ơn bạn đã ủng hộ Highlands Coffee! Rất hân hạnh được phục vụ bạn.'),
(2, 7,  15, 4, N'CGV rạp sạch sẽ, phục vụ tốt. Tuy nhiên voucher không áp dụng được cho phòng chiếu IMAX.',
    '2026-05-15 21:00:00', N'CGV xin chào! Dạ voucher vé 2D chuẩn chỉ áp dụng cho phòng chiếu 2D thường ạ. Mong bạn thông cảm.'),
(3, 13, 16, 5, N'Trà đào sữa Phúc Long thì không có gì để chê rồi, vị đậm đà thơm ngậy, phục vụ chu đáo!',
    '2026-05-14 15:00:00', N'Phúc Long cám ơn quý khách đã tin dùng sản phẩm. Chúc quý khách một ngày tốt lành!'),
(4, 12, 15, 3, N'Nước uống ngon nhưng chi nhánh Crescent Mall hôm nay đông khách quá chờ hơi lâu.',
    '2026-05-17 17:30:00', N'Phúc Long chân thành xin lỗi vì sự bất tiện này. Chúng tôi sẽ cố gắng tăng tốc độ phục vụ vào giờ cao điểm.');
SET IDENTITY_INSERT [DanhGia] OFF;


-- ============================================================
-- BƯỚC 18: FAQ
-- ============================================================
SET IDENTITY_INSERT [FAQ] ON;
INSERT [FAQ] ([MaFAQ], [CauHoi], [TraLoi], [DanhMucFAQ], [ThuTu], [TrangThai])
VALUES
(1, N'Làm thế nào để tôi sử dụng voucher đã mua?',
    N'Bạn chỉ cần truy cập vào mục "Voucher của tôi", chọn voucher muốn sử dụng và xuất trình mã code (hoặc QR Code) cho nhân viên thu ngân quét khi thanh toán tại cửa hàng.',
    N'Hướng dẫn sử dụng', 1, N'Hiển thị'),
(2, N'Tôi có thể hoàn tiền voucher sau khi đã mua thành công không?',
    N'Tùy thuộc vào chính sách hoàn tiền của từng loại voucher cụ thể (được hiển thị chi tiết ở phần thông tin voucher). Đối với một số voucher F&B hoặc vé phim, chính sách thường là không đổi trả sau khi giao dịch hoàn tất.',
    N'Chính sách', 2, N'Hiển thị'),
(3, N'Voucher có thể áp dụng đồng thời với các khuyến mãi khác của cửa hàng không?',
    N'Hầu hết các e-voucher không áp dụng đồng thời với các chương trình khuyến mãi khác tại cửa hàng trừ khi có quy định khác trong phần điều kiện sử dụng của voucher.',
    N'Điều khoản chung', 3, N'Hiển thị');
SET IDENTITY_INSERT [FAQ] OFF;


-- ============================================================
-- BƯỚC 19: BaiViet
-- ============================================================
SET IDENTITY_INSERT [BaiViet] ON;
INSERT [BaiViet] ([MaBaiViet], [TieuDe], [NoiDung], [TacGia], [LuotXem], [TrangThai], [NgayTao])
VALUES
(1, N'Bùng nổ cơn lốc trà trái cây tại Phúc Long tuần này',
    N'Tuần này Phúc Long mang đến dòng sản phẩm trà trái cây nhiệt đới tươi mát kèm ưu đãi voucher cực khủng giảm ngay 20% khi đặt trước qua ứng dụng Voucher Hub...',
    N'Phúc Long News', 120, N'Hiển thị', '2026-05-01 08:00:00'),
(2, N'Trải nghiệm phòng chiếu IMAX cực đỉnh cùng CGV Cinemas',
    N'Phòng chiếu IMAX với công nghệ âm thanh vòm và màn hình cong cực đại mang đến trải nghiệm xem phim hoàn toàn khác biệt. Đặt vé ngay hôm nay cùng Voucher giảm giá 50k vé IMAX tại hệ thống rạp CGV...',
    N'CGV Cinema', 340, N'Hiển thị', '2026-05-05 09:30:00');
SET IDENTITY_INSERT [BaiViet] OFF;


-- ============================================================
-- BƯỚC 20: Banner
-- ============================================================
SET IDENTITY_INSERT [Banner] ON;
INSERT [Banner] ([MaBanner], [TieuDe], [HinhAnh], [LinkURL], [ViTri], [TrangThai], [ThuTu], [NgayTao], [Tag], [MoTa], [ThoiGianKetThuc], [VanBanNut])
VALUES
(1, N'Ưu đãi Highlands Coffee - Giảm ngay 10%',
    '/uploads/general/banner/homepage_top/highlands_banner.jpg', '/brand/1', N'homepage_top', N'Đang hiển thị', 1,
    '2026-05-01 00:00:00', N'Ẩm thực',
    N'Ưu đãi cực khủng dành cho tín đồ yêu mến Highlands Coffee.',
    '2026-12-31 23:59:59', N'Xem ngay'),
(2, N'Đại tiệc phim hè cùng CGV Cinemas',
    '/uploads/general/banner/homepage_top/cgv_banner.jpg', '/brand/2', N'homepage_top', N'Đang hiển thị', 2,
    '2026-05-02 00:00:00', N'Giải trí',
    N'Xem phim cực đỉnh, nhận quà cực đã cùng hàng loạt bom tấn mùa hè.',
    '2026-09-30 23:59:59', N'Đặt vé ngay'),
(3, N'Đại tiệc trà sữa Phúc Long - Mua 2 tặng 1',
    '/uploads/general/banner/homepage_top/phuclong_banner.jpg', '/brand/3', N'homepage_top', N'Đang hiển thị', 3,
    '2026-05-03 00:00:00', N'Ẩm thực',
    N'Thưởng thức trà sữa và cà phê Phúc Long đậm vị cùng ưu đãi cực hot.',
    '2026-12-31 23:59:59', N'Khám phá ngay'),
(4, N'Siêu deal giữa trang - Giảm tới 50%',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200', '/search', N'homepage_middle', N'Đang hiển thị', 1,
    '2026-05-04 00:00:00', N'Khuyến mãi',
    N'Chào hè rực rỡ cùng hàng ngàn deal xịn sò trên khắp cả nước.',
    '2026-12-31 23:59:59', N'Nhận deal ngay'),
(5, N'Ẩm thực đường phố - Ăn ngon giá rẻ',
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200', '/search?category=1', N'category_page', N'Đang hiển thị', 1,
    '2026-05-05 00:00:00', N'Ẩm thực',
    N'Ăn uống thả ga không lo về giá cùng voucher giảm giá ẩm thực lên tới 50%.',
    '2026-12-31 23:59:59', N'Tìm hiểu thêm'),
(6, N'Bom tấn rạp Việt - CGV & Lotte Cinemas',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200', '/search?category=2', N'category_page', N'Đang hiển thị', 1,
    '2026-05-06 00:00:00', N'Giải trí',
    N'Trải nghiệm bom tấn điện ảnh cực đã cùng hàng loạt quà tặng vé xem phim hot.',
    '2026-12-31 23:59:59', N'Đặt vé ngay'),
(7, N'Săn sale sập sàn - Hàng hiệu giá cực chất',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200', '/search?category=3', N'category_page', N'Đang hiển thị', 1,
    '2026-05-07 00:00:00', N'Mua sắm',
    N'Mua sắm thỏa thích các mặt hàng thời trang, mỹ phẩm và công nghệ hàng đầu.',
    '2026-12-31 23:59:59', N'Săn sale ngay'),
(8, N'Chăm sóc sức khỏe - Spa & Gym trọn gói',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', '/search?category=4', N'category_page', N'Đang hiển thị', 1,
    '2026-05-08 00:00:00', N'Dịch vụ',
    N'Tận hưởng giây phút thư giãn cơ thể và tập luyện nâng cao thể lực trọn gói.',
    '2026-12-31 23:59:59', N'Đăng ký ngay');
SET IDENTITY_INSERT [Banner] OFF;


-- ============================================================
-- BƯỚC 21: SystemLog
-- ============================================================
SET IDENTITY_INSERT [SystemLog] ON;
INSERT [SystemLog] ([MaLog], [IDTaiKhoan], [HanhDong], [DoiTuong], [ChiTiet], [DiaChiIP], [TrangThai], [ThoiGian])
VALUES
(1, 1,  N'Đăng nhập thành công', N'admin',          N'Admin đăng nhập hệ thống',                             '127.0.0.1',    N'Thành công', '2026-06-01 08:00:00'),
(2, 5,  N'Đăng nhập thành công', N'highlands_emp1', N'Quản lý Highlands đăng nhập',                          '192.168.1.10', N'Thành công', '2026-06-01 08:30:00'),
(3, 14, N'Mua voucher',          N'customer1',      N'Khách hàng mua thành công 2 Voucher Highlands Coffee 50k', '192.168.1.20', N'Thành công', '2026-05-10 10:00:00');
SET IDENTITY_INSERT [SystemLog] OFF;


-- ============================================================
-- BƯỚC CUỐI: Kích hoạt lại toàn bộ ràng buộc khóa ngoại
-- ============================================================
DECLARE @sql_enable NVARCHAR(MAX) = N'';
SELECT @sql_enable += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.'
    + QUOTENAME(OBJECT_NAME(parent_object_id))
    + ' WITH CHECK CHECK CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys;
EXEC sp_executesql @sql_enable;
