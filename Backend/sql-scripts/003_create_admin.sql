-- Create an Admin user
-- Username: admin
-- Password: Admin@123
-- Email: admin@voucherhub.com

DECLARE @TaiKhoanID INT;

-- 1. Insert into TaiKhoan
-- The MatKhau is pre-hashed using bcrypt for "Admin@123"
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, Email, HoTenNguoiDung)
VALUES (
    'admin', 
    '$2b$10$KWi02S1eV7Ufw6W86PUjy.JyxzxcsCmJ2kwRhgw7J4TNZMT2y7oZC', 
    'admin@voucherhub.com', 
    N'System Administrator'
);

-- Get the ID of the newly created TaiKhoan
SET @TaiKhoanID = SCOPE_IDENTITY();

-- 2. Insert into Admin to link the role
-- SDT_Admin is the Primary Key for the Admin table
INSERT INTO Admin (SDT_Admin, IDTaiKhoan)
VALUES ('0123456789', @TaiKhoanID);

PRINT 'Admin user created successfully!';
