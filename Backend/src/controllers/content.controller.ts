import { Request, Response } from 'express';
import prisma from '../config/db';
import { VOUCHER_STATUS } from '../constants';

// === FAQ ===
export const getFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { ThuTu: 'asc' } });
    res.json(faqs);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createFAQ = async (req: Request, res: Response) => {
  try {
    const { CauHoi, TraLoi, DanhMucFAQ, ThuTu, TrangThai } = req.body;
    const faq = await prisma.fAQ.create({
      data: {
        CauHoi,
        TraLoi,
        DanhMucFAQ,
        ThuTu: ThuTu !== undefined ? Number(ThuTu) : 0,
        TrangThai: TrangThai || 'Hiển thị'
      }
    });
    res.status(201).json(faq);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { MaFAQ, ...updateData } = req.body;
    if (updateData.ThuTu !== undefined) {
      updateData.ThuTu = Number(updateData.ThuTu);
    }
    const faq = await prisma.fAQ.update({
      where: { MaFAQ: Number(id) },
      data: updateData
    });
    res.json(faq);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { MaFAQ: Number(id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

// === Banner ===  
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { ThuTu: 'asc' } });
    res.json(banners);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { TieuDe, HinhAnh, LinkURL, ViTri, TrangThai, ThuTu, Tag, MoTa, ThoiGianKetThuc, VanBanNut } = req.body;
    const banner = await prisma.banner.create({
      data: {
        TieuDe,
        HinhAnh,
        LinkURL,
        ViTri,
        TrangThai: TrangThai || 'Đang hiển thị',
        ThuTu: ThuTu !== undefined ? Number(ThuTu) : 0,
        Tag,
        MoTa,
        ThoiGianKetThuc: ThoiGianKetThuc ? new Date(ThoiGianKetThuc) : null,
        VanBanNut
      }
    });
    res.status(201).json(banner);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { MaBanner, ...updateData } = req.body;
    if (updateData.ThuTu !== undefined) {
      updateData.ThuTu = Number(updateData.ThuTu);
    }
    if (updateData.ThoiGianKetThuc !== undefined) {
      updateData.ThoiGianKetThuc = updateData.ThoiGianKetThuc ? new Date(updateData.ThoiGianKetThuc) : null;
    }
    const banner = await prisma.banner.update({
      where: { MaBanner: Number(id) },
      data: updateData
    });
    res.json(banner);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { MaBanner: Number(id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

// === Bài Viết ===
export const getBaiViets = async (req: Request, res: Response) => {
  try {
    const baiViets = await prisma.baiViet.findMany({ orderBy: { NgayTao: 'desc' } });
    res.json(baiViets);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createBaiViet = async (req: Request, res: Response) => {
  try {
    const { TieuDe, NoiDung, TacGia, TrangThai, LuotXem } = req.body;
    const baiViet = await prisma.baiViet.create({
      data: {
        TieuDe,
        NoiDung,
        TacGia,
        TrangThai: TrangThai || 'Nháp',
        LuotXem: LuotXem !== undefined ? Number(LuotXem) : 0
      }
    });
    res.status(201).json(baiViet);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateBaiViet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { MaBaiViet, ...updateData } = req.body;
    if (updateData.LuotXem !== undefined) {
      updateData.LuotXem = Number(updateData.LuotXem);
    }
    const baiViet = await prisma.baiViet.update({
      where: { MaBaiViet: Number(id) },
      data: updateData
    });
    res.json(baiViet);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteBaiViet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.baiViet.delete({ where: { MaBaiViet: Number(id) } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const incrementBaiVietView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const baiViet = await prisma.baiViet.update({
      where: { MaBaiViet: Number(id) },
      data: { LuotXem: { increment: 1 } }
    });
    res.json({ message: 'View count increased successfully', views: baiViet.LuotXem });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

// === Danh mục ===
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.danhMuc.findMany({
      where: {
        NOT: { MoTa: { contains: '"isDeleted":true' } }
      },
      include: {
        _count: {
          select: { Vouchers: true }
        },
        Vouchers: {
          where: {
            OR: [
              { TrangThaiVoucher: VOUCHER_STATUS.ACTIVE },
              {
                TrangThaiVoucher: VOUCHER_STATUS.PAUSED,
                ThoiGianKetThuc: { gt: new Date() }
              }
            ]
          },
          select: { VoucherID: true }
        }
      }
    });
    const mapped = categories.map(c => {
      let icon = 'Tag';
      let moTa = c.MoTa || '';
      try {
        if (c.MoTa && c.MoTa.startsWith('{')) {
          const parsed = JSON.parse(c.MoTa);
          if (parsed && parsed.icon) {
            icon = parsed.icon;
            moTa = parsed.text || '';
          }
        }
      } catch (e) {
    console.error('Server error:', e);
        console.error('Error parsing category MoTa:', e);
      }
      return {
        id: c.MaDanhMuc,
        name: c.TenDanhMuc,
        moTa: moTa,
        vouchers: c._count.Vouchers,
        activeVouchers: c.Vouchers.length,
        icon: icon,
        status: 'Hiển thị'
      };
    });
    res.json(mapped);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { TenDanhMuc, MoTa, Icon } = req.body;
    const MoTaJson = JSON.stringify({ icon: Icon || 'Tag', text: MoTa || '' });
    const category = await prisma.danhMuc.create({
      data: {
        TenDanhMuc,
        MoTa: MoTaJson
      }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { TenDanhMuc, MoTa, Icon } = req.body;
    const MoTaJson = JSON.stringify({ icon: Icon || 'Tag', text: MoTa || '' });
    const category = await prisma.danhMuc.update({
      where: { MaDanhMuc: Number(id) },
      data: {
        TenDanhMuc,
        MoTa: MoTaJson
      }
    });
    res.json(category);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activeCount = await prisma.voucher.count({
      where: {
        MaDanhMuc: Number(id),
        OR: [
          { TrangThaiVoucher: VOUCHER_STATUS.ACTIVE },
          {
            TrangThaiVoucher: VOUCHER_STATUS.PAUSED,
            ThoiGianKetThuc: { gt: new Date() }
          }
        ]
      }
    });
    if (activeCount > 0) {
      return res.status(400).json({ error: 'Không thể xóa danh mục này vì đang có voucher hoạt động.' });
    }

    const category = await prisma.danhMuc.findUnique({ where: { MaDanhMuc: Number(id) } });
    if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục' });

    let moTaObj: any = { icon: 'Tag', text: '' };
    try {
      if (category.MoTa && category.MoTa.startsWith('{')) {
        moTaObj = JSON.parse(category.MoTa);
      } else {
        moTaObj.text = category.MoTa || '';
      }
    } catch(e) {}
    
    moTaObj.isDeleted = true;

    await prisma.danhMuc.update({
      where: { MaDanhMuc: Number(id) },
      data: { MoTa: JSON.stringify(moTaObj) }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};
