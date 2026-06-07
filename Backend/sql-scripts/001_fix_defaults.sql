-- Fix BaiViet default
ALTER TABLE BaiViet DROP CONSTRAINT IF EXISTS DF__BaiViet__TrangTh__7D0E9093;
ALTER TABLE BaiViet ADD CONSTRAINT DF_BaiViet_TrangThai_Fixed DEFAULT N'Nháp' FOR TrangThai;

-- Fix Banner default  
ALTER TABLE Banner DROP CONSTRAINT IF EXISTS DF__Banner__TrangTha__756D6ECB;
ALTER TABLE Banner ADD CONSTRAINT DF_Banner_TrangThai_Fixed DEFAULT N'Đang hiển thị' FOR TrangThai;

-- Fix FAQ default
ALTER TABLE FAQ DROP CONSTRAINT IF EXISTS DF__FAQ__TrangThai__02C769E9;
ALTER TABLE FAQ ADD CONSTRAINT DF_FAQ_TrangThai_Fixed DEFAULT N'Hiển thị' FOR TrangThai;

-- Update existing rows that have the broken value
UPDATE BaiViet SET TrangThai = N'Nháp' WHERE TrangThai = N'N''Nháp''';
UPDATE Banner SET TrangThai = N'Đang hiển thị' WHERE TrangThai = N'N''Đang hiển thị''';
UPDATE FAQ SET TrangThai = N'Hiển thị' WHERE TrangThai = N'N''Hiển thị''';


SELECT 
    t.name AS table_name,
    c.name AS column_name,
    dc.name AS default_constraint_name,
    dc.definition
FROM sys.default_constraints dc
JOIN sys.columns c 
    ON dc.parent_object_id = c.object_id
   AND dc.parent_column_id = c.column_id
JOIN sys.tables t
    ON t.object_id = c.object_id
WHERE t.name IN ('BaiViet', 'Banner', 'FAQ')
  AND c.name = 'TrangThai';