-- Create SystemLog table for recording system events
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='SystemLog' and xtype='U')
BEGIN
    CREATE TABLE SystemLog (
        MaLog INT IDENTITY(1,1) PRIMARY KEY,
        IDTaiKhoan INT NULL,
        HanhDong NVARCHAR(255) NOT NULL,
        DoiTuong NVARCHAR(255) NULL,
        ChiTiet NVARCHAR(MAX) NULL,
        DiaChiIP VARCHAR(50) NULL,
        TrangThai NVARCHAR(50) NULL,
        ThoiGian DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (IDTaiKhoan) REFERENCES TaiKhoan(IDTaiKhoan)
    );
END
GO
