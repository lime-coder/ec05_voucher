import prisma from './config/db';
import fs from 'fs';
import path from 'path';
import { generateSlug } from './utils/slug.util';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const migrateFile = (oldUrl: string | null, destFolder: string, newFilename: string): string | null => {
  if (!oldUrl || !oldUrl.startsWith('/uploads/')) return oldUrl;
  
  // If it's already following the new structure loosely, we might skip, but let's just move it to be safe
  const relativeOldPath = oldUrl.replace('/uploads/', '');
  const absoluteOldPath = path.join(UPLOADS_DIR, relativeOldPath);

  if (!fs.existsSync(absoluteOldPath)) {
    console.log(`[SKIP] File not found on disk: ${absoluteOldPath}`);
    return oldUrl;
  }

  const destDirPath = path.join(UPLOADS_DIR, destFolder);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }

  const ext = path.extname(absoluteOldPath);
  const timestamp = Date.now();
  const finalFilename = `${newFilename}_${timestamp}${ext}`;
  const finalPath = path.join(destDirPath, finalFilename);

  // Move the file
  fs.renameSync(absoluteOldPath, finalPath);
  
  const newUrl = `/uploads/${destFolder}/${finalFilename}`;
  console.log(`[MIGRATED] ${oldUrl} -> ${newUrl}`);
  return newUrl;
};

async function runMigration() {
  console.log('--- Starting Media Migration ---');

  // 1. Migrate Partners
  console.log('\n--- Migrating Partners ---');
  const partners = await prisma.doiTac.findMany();
  for (const partner of partners) {
    if (partner.AvatarUrl) {
      const destFolder = 'avatar/partner';
      const newFilename = `partner_${partner.MaDoiTac}_${generateSlug(partner.TenDoanhNghiep)}`;
      const newUrl = migrateFile(partner.AvatarUrl, destFolder, newFilename);
      if (newUrl !== partner.AvatarUrl) {
        await prisma.doiTac.update({
          where: { MaDoiTac: partner.MaDoiTac },
          data: { AvatarUrl: newUrl }
        });
      }
    }
  }

  // 2. Migrate Customers
  console.log('\n--- Migrating Customers ---');
  const customers = await prisma.khachHang.findMany({
    include: { TaiKhoan: true }
  });
  // Note: Customers don't have an Avatar field in the provided schema. If TaiKhoan has an avatar, we migrate it.
  // Looking at the schema, there is no AvatarUrl for TaiKhoan or KhachHang. Wait!
  // Ah, I need to check if there is an AvatarUrl in TaiKhoan or KhachHang. 
  // Let's skip customer avatar if it doesn't exist in schema.

  // 3. Migrate Banners
  console.log('\n--- Migrating Banners ---');
  const banners = await prisma.banner.findMany();
  for (const banner of banners) {
    if (banner.HinhAnh) {
      const bannerType = banner.ViTri || '';
      let subfolder = 'homepage_top';
      if (bannerType.includes('mid') || bannerType.includes('giữa')) subfolder = 'homepage_middle';
      if (bannerType.toLowerCase().includes('danh mục') || bannerType.toLowerCase().includes('category')) subfolder = 'category_banner';

      const destFolder = `general/banner/${subfolder}`;
      const newFilename = `banner_${banner.MaBanner}_${generateSlug(banner.TieuDe)}`;
      const newUrl = migrateFile(banner.HinhAnh, destFolder, newFilename);
      if (newUrl !== banner.HinhAnh) {
        await prisma.banner.update({
          where: { MaBanner: banner.MaBanner },
          data: { HinhAnh: newUrl }
        });
      }
    }
  }

  // 4. Migrate Vouchers
  console.log('\n--- Migrating Vouchers ---');
  const vouchers = await prisma.voucher.findMany({
    include: { DoiTac: true }
  });
  for (const voucher of vouchers) {
    if (voucher.ImageUrl) {
      const partnerName = voucher.DoiTac ? voucher.DoiTac.TenDoanhNghiep : 'Unknown';
      const partnerFolder = `partner_${voucher.MaDoiTac}_${generateSlug(partnerName)}`;
      const destFolder = `vouchers/${partnerFolder}`;
      const newFilename = `voucher_${voucher.VoucherID}_${generateSlug(voucher.TenVoucher)}_01`;

      const newUrl = migrateFile(voucher.ImageUrl, destFolder, newFilename);
      if (newUrl !== voucher.ImageUrl) {
        await prisma.voucher.update({
          where: { VoucherID: voucher.VoucherID },
          data: { ImageUrl: newUrl }
        });
      }
    }
  }

  console.log('\n--- Migration Completed ---');
}

runMigration().catch(console.error).finally(() => prisma.$disconnect());
