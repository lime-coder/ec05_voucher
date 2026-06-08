import { Request, Response } from 'express';
import prisma from '../config/db';

// === FAQ ===
export const getFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { ThuTu: 'asc' } });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
    res.status(500).json({ error: (error as Error).message });
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
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.fAQ.delete({ where: { MaFAQ: Number(id) } });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Banner ===  
export const getBanners = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { ThuTu: 'asc' } });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const { TieuDe, HinhAnh, LinkURL, ViTri, TrangThai, ThuTu } = req.body;
    const banner = await prisma.banner.create({
      data: {
        TieuDe,
        HinhAnh,
        LinkURL,
        ViTri,
        TrangThai: TrangThai || 'Đang hiển thị',
        ThuTu: ThuTu !== undefined ? Number(ThuTu) : 0
      }
    });
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { MaBanner, ...updateData } = req.body;
    if (updateData.ThuTu !== undefined) {
      updateData.ThuTu = Number(updateData.ThuTu);
    }
    const banner = await prisma.banner.update({
      where: { MaBanner: Number(id) },
      data: updateData
    });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { MaBanner: Number(id) } });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Bài Viết ===
export const getBaiViets = async (req: Request, res: Response) => {
  try {
    const baiViets = await prisma.baiViet.findMany({ orderBy: { NgayTao: 'desc' } });
    res.json(baiViets);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
    res.status(500).json({ error: (error as Error).message });
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
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteBaiViet = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.baiViet.delete({ where: { MaBaiViet: Number(id) } });
    res.json({ message: 'Đã xóa' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const incrementBaiVietView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const baiViet = await prisma.baiViet.update({
      where: { MaBaiViet: Number(id) },
      data: { LuotXem: { increment: 1 } }
    });
    res.json({ message: 'Đã tăng lượt xem', views: baiViet.LuotXem });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// === Danh mục ===
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.danhMuc.findMany({
      include: {
        Vouchers: true
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
        console.error('Error parsing category MoTa:', e);
      }
      return {
        id: c.MaDanhMuc,
        name: c.TenDanhMuc,
        moTa: moTa,
        vouchers: c.Vouchers.length,
        icon: icon,
        status: 'Hiển thị'
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
    res.status(500).json({ error: (error as Error).message });
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
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const count = await prisma.voucher.count({
      where: { MaDanhMuc: Number(id) }
    });
    if (count > 0) {
      return res.status(400).json({ error: 'Không thể xóa danh mục này vì đang có voucher thuộc danh mục.' });
    }
    await prisma.danhMuc.delete({ where: { MaDanhMuc: Number(id) } });
    res.json({ message: 'Đã xóa danh mục' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
