import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/db';
import { logActivity, deleteImageFile } from './index';

export const getContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [banners, articles, faqs] = await Promise.all([
      prisma.banner.findMany({ orderBy: { ThuTu: 'asc' } }),
      prisma.baiViet.findMany({ orderBy: { NgayTao: 'desc' } }),
      prisma.fAQ.findMany({ orderBy: { ThuTu: 'asc' } })
    ]);
    res.json({ banners, articles, faqs });
  } catch (error) {
    next(error);
  }
};

export const createContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, ...data } = req.body;
    if (type === 'banner') {
      if (!String(data.TieuDe || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề banner' });
      }
      const banner = await prisma.banner.create({
        data: {
          TieuDe: data.TieuDe || '',
          HinhAnh: data.HinhAnh || '',
          LinkURL: data.LinkURL || '',
          ViTri: data.ViTri || 'Homepage Top',
          TrangThai: data.TrangThai || 'Đang hiển thị',
          ThuTu: data.ThuTu !== undefined ? Number(data.ThuTu) : 0
        }
      });
      return res.status(201).json(banner);
    } else if (type === 'article') {
      if (!String(data.TieuDe || '').trim() || !String(data.NoiDung || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề và nội dung bài viết' });
      }
      const article = await prisma.baiViet.create({
        data: {
          TieuDe: data.TieuDe || '',
          NoiDung: data.NoiDung || '',
          TacGia: data.TacGia || 'Admin',
          TrangThai: data.TrangThai || 'Nháp',
          LuotXem: data.LuotXem !== undefined ? Number(data.LuotXem) : 0
        }
      });
      return res.status(201).json(article);
    } else if (type === 'faq') {
      if (!String(data.CauHoi || '').trim() || !String(data.TraLoi || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi và câu trả lời' });
      }
      const faq = await prisma.fAQ.create({
        data: {
          CauHoi: data.CauHoi || '',
          TraLoi: data.TraLoi || '',
          DanhMucFAQ: data.DanhMucFAQ || 'Mua hàng',
          ThuTu: data.ThuTu !== undefined ? Number(data.ThuTu) : 0,
          TrangThai: data.TrangThai || 'Hiển thị'
        }
      });
      return res.status(201).json(faq);
    } else {
      return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
    }
  } catch (error) {
    next(error);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, ...data } = req.body;

    if (type === 'banner') {
      const { MaBanner, ...updateData } = data;
      if (updateData.TieuDe !== undefined && !String(updateData.TieuDe).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề banner' });
      }
      if (updateData.ThuTu !== undefined) {
        updateData.ThuTu = Number(updateData.ThuTu);
      }
      const oldBanner = await prisma.banner.findUnique({ where: { MaBanner: Number(id) } });
      const banner = await prisma.banner.update({
        where: { MaBanner: Number(id) },
        data: updateData
      });
      if (oldBanner && updateData.HinhAnh && oldBanner.HinhAnh !== updateData.HinhAnh) {
        deleteImageFile(oldBanner.HinhAnh);
      }
      return res.json(banner);
    } else if (type === 'article') {
      const { MaBaiViet, ...updateData } = data;
      if (updateData.TieuDe !== undefined && !String(updateData.TieuDe).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề bài viết' });
      }
      if (updateData.NoiDung !== undefined && !String(updateData.NoiDung).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung bài viết' });
      }
      if (updateData.LuotXem !== undefined) {
        updateData.LuotXem = Number(updateData.LuotXem);
      }
      const article = await prisma.baiViet.update({
        where: { MaBaiViet: Number(id) },
        data: updateData
      });
      return res.json(article);
    } else if (type === 'faq') {
      const { MaFAQ, ...updateData } = data;
      if (updateData.CauHoi !== undefined && !String(updateData.CauHoi).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu hỏi' });
      }
      if (updateData.TraLoi !== undefined && !String(updateData.TraLoi).trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập câu trả lời' });
      }
      if (updateData.ThuTu !== undefined) {
        updateData.ThuTu = Number(updateData.ThuTu);
      }
      const faq = await prisma.fAQ.update({
        where: { MaFAQ: Number(id) },
        data: updateData
      });
      return res.json(faq);
    } else {
      return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'banner') {
      const rec = await prisma.banner.findUnique({ where: { MaBanner: Number(id) } });
      if (rec?.HinhAnh) {
        deleteImageFile(rec.HinhAnh);
      }
      await prisma.banner.delete({ where: { MaBanner: Number(id) } });
      logActivity(req, 'Xóa banner', rec?.TieuDe || `Banner ID: ${id}`);
      return res.json({ message: 'Banner deleted successfully' });
    } else if (type === 'article') {
      const rec = await prisma.baiViet.findUnique({ where: { MaBaiViet: Number(id) } });
      if ((rec as any)?.HinhAnh) {
        deleteImageFile((rec as any).HinhAnh);
      }
      await prisma.baiViet.delete({ where: { MaBaiViet: Number(id) } });
      logActivity(req, 'Xóa bài viết', (rec as any)?.TieuDe || `Bài viết ID: ${id}`);
      return res.json({ message: 'Article deleted successfully' });
    } else if (type === 'faq') {
      await prisma.fAQ.delete({ where: { MaFAQ: Number(id) } });
      logActivity(req, 'Xóa FAQ', `FAQ ID: ${id}`);
      return res.json({ message: 'FAQ deleted successfully' });
    }
    return res.status(400).json({ error: 'Loại nội dung không hợp lệ' });
  } catch (error) {
    next(error);
  }
};
