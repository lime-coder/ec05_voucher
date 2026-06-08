import fs from 'fs';
import path from 'path';
import { generateSlug } from './slug.util';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const moveTempFile = (tempUrl: string, destFolder: string, newFilename: string): string | null => {
  if (!tempUrl || !tempUrl.startsWith('/uploads/temp/')) {
    // If it's not a temp URL, it might already be a permanent URL or null
    return tempUrl;
  }

  const tempFilename = path.basename(tempUrl);
  const tempPath = path.join(UPLOADS_DIR, 'temp', tempFilename);
  const destDirPath = path.join(UPLOADS_DIR, destFolder);
  const ext = path.extname(tempFilename);
  
  // Cache busting: append timestamp to filename
  const timestamp = Date.now();
  const finalFilename = `${newFilename}_${timestamp}${ext}`;
  const finalPath = path.join(destDirPath, finalFilename);

  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }

  if (fs.existsSync(tempPath)) {
    fs.renameSync(tempPath, finalPath);
    return `/uploads/${destFolder}/${finalFilename}`;
  }

  return tempUrl; // fallback if temp file missing
};

export const deleteMediaFile = (fileUrl: string | null | undefined) => {
  if (!fileUrl) return;
  
  const urls = fileUrl.split(',').map(u => u.trim());
  urls.forEach(url => {
    let processUrl = url;
    if (processUrl.startsWith('http')) {
      try {
        const urlObj = new URL(processUrl);
        processUrl = urlObj.pathname;
      } catch(e) {}
    }

    // Make sure we only delete files in /uploads/
    if (!processUrl.startsWith('/uploads/')) return;

    // Reconstruct path
    const relativePath = processUrl.replace('/uploads/', '');
    const absolutePath = path.join(UPLOADS_DIR, relativePath);

    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (e) {
        console.error(`Error deleting media file ${absolutePath}:`, e);
      }
    }
  });
};

export const commitVoucherImage = (tempUrl: string, voucherId: number, partnerId: number, partnerName: string, voucherName: string, oldImageUrl?: string): string | null => {
  // Upload/vouchers/partner_[MaDoiTac]_[TenDoanhNghiep_Slug]/voucher_[VoucherID]_[TenVoucher_Slug]_[PicNumber].ext
  const partnerFolder = `partner_${partnerId}_${generateSlug(partnerName)}`;
  const destFolder = path.posix.join('vouchers', partnerFolder);
  
  const urls = tempUrl.split(',').map(u => u.trim()).filter(u => u.length > 0);
  const finalUrls: string[] = [];

  urls.forEach((url, index) => {
    // Format pic number as 01, 02, etc.
    const picNumber = String(index + 1).padStart(2, '0');
    const newFilename = `voucher_${voucherId}_${generateSlug(voucherName)}_${picNumber}`;
    
    const newUrl = moveTempFile(url, destFolder, newFilename);
    if (newUrl) {
      finalUrls.push(newUrl);
    }
  });

  const finalString = finalUrls.join(',');

  // Delete old images that are no longer in the final list
  if (oldImageUrl) {
    const oldUrls = oldImageUrl.split(',').map(u => u.trim()).filter(u => u.length > 0);
    oldUrls.forEach(oldUrl => {
      if (!finalUrls.includes(oldUrl)) {
        deleteMediaFile(oldUrl);
      }
    });
  }

  return finalString || null;
};

export const commitPartnerAvatar = (tempUrl: string, partnerId: number, partnerName: string, oldImageUrl?: string): string | null => {
  const destFolder = 'avatar/partner';
  const newFilename = `partner_${partnerId}_${generateSlug(partnerName)}`;

  const newUrl = moveTempFile(tempUrl, destFolder, newFilename);
  if (newUrl !== oldImageUrl) {
    deleteMediaFile(oldImageUrl);
  }
  return newUrl;
};

export const commitCustomerAvatar = (tempUrl: string, accountId: number, customerName: string, oldImageUrl?: string): string | null => {
  const destFolder = 'avatar/customer';
  const newFilename = `customer_${accountId}_${generateSlug(customerName)}`;

  const newUrl = moveTempFile(tempUrl, destFolder, newFilename);
  if (newUrl !== oldImageUrl) {
    deleteMediaFile(oldImageUrl);
  }
  return newUrl;
};

export const commitBannerImage = (tempUrl: string, bannerId: number, bannerTitle: string, bannerType: string, oldImageUrl?: string): string | null => {
  let subfolder = 'homepage_top';
  if (bannerType.includes('mid') || bannerType.includes('giữa')) subfolder = 'homepage_middle';
  if (bannerType.toLowerCase().includes('danh mục') || bannerType.toLowerCase().includes('category')) subfolder = 'category_banner';

  const destFolder = path.posix.join('general', 'banner', subfolder);
  const newFilename = `banner_${bannerId}_${generateSlug(bannerTitle)}`;

  const newUrl = moveTempFile(tempUrl, destFolder, newFilename);
  if (newUrl !== oldImageUrl) {
    deleteMediaFile(oldImageUrl);
  }
  return newUrl;
};
