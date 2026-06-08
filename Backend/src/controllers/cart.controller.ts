import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCart = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });

    // Lấy hoặc tạo giỏ hàng
    let cart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
      include: {
        ChiTiet: {
          include: {
            Voucher: true
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.gioHang.create({
        data: { IDTaiKhoan: customerId },
        include: { ChiTiet: { include: { Voucher: true } } }
      });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi lấy giỏ hàng:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const syncCart = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });
    const { items } = req.body; // Mảng items từ local storage cần merge

    let cart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
    });

    if (!cart) {
      cart = await prisma.gioHang.create({
        data: { IDTaiKhoan: customerId },
      });
    }

    if (items && Array.isArray(items) && items.length > 0) {
      // Merge items from local storage
      for (const item of items) {
        const existingItem = await prisma.chiTietGioHang.findFirst({
          where: {
            MaGioHang: cart.MaGioHang,
            VoucherID: item.voucherId,
          }
        });

        if (existingItem) {
          await prisma.chiTietGioHang.update({
            where: { MaCTGioHang: existingItem.MaCTGioHang },
            data: { SoLuong: Math.max(existingItem.SoLuong!, item.quantity) }
          });
        } else {
          await prisma.chiTietGioHang.create({
            data: {
              MaGioHang: cart.MaGioHang,
              VoucherID: item.voucherId,
              SoLuong: item.quantity,
            }
          });
        }
      }
    }

    // Return the updated cart
    const updatedCart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
      include: {
        ChiTiet: {
          include: {
            Voucher: true
          }
        }
      }
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi đồng bộ giỏ hàng:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });
    const { voucherId, quantity } = req.body;

    let cart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
    });

    if (!cart) {
      cart = await prisma.gioHang.create({
        data: { IDTaiKhoan: customerId },
      });
    }

    const existingItem = await prisma.chiTietGioHang.findFirst({
      where: {
        MaGioHang: cart.MaGioHang,
        VoucherID: voucherId,
      }
    });

    if (existingItem) {
      await prisma.chiTietGioHang.update({
        where: { MaCTGioHang: existingItem.MaCTGioHang },
        data: { SoLuong: existingItem.SoLuong! + quantity }
      });
    } else {
      await prisma.chiTietGioHang.create({
        data: {
          MaGioHang: cart.MaGioHang,
          VoucherID: voucherId,
          SoLuong: quantity,
        }
      });
    }

    res.status(200).json({ message: 'Added to cart successfully' });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi thêm sản phẩm:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });
    const { voucherId } = req.params;
    const { quantity } = req.body;

    const cart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
    });

    if (!cart) return res.status(404).json({ message: 'error.cart_not_found' });

    const existingItem = await prisma.chiTietGioHang.findFirst({
      where: {
        MaGioHang: cart.MaGioHang,
        VoucherID: parseInt(voucherId, 10),
      }
    });

    if (!existingItem) return res.status(404).json({ message: 'error.item_not_in_cart' });

    await prisma.chiTietGioHang.update({
      where: { MaCTGioHang: existingItem.MaCTGioHang },
      data: { SoLuong: quantity }
    });

    res.status(200).json({ message: 'Quantity updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi cập nhật sản phẩm:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });
    const { voucherId } = req.params;

    const cart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
    });

    if (!cart) return res.status(404).json({ message: 'error.cart_not_found' });

    const existingItem = await prisma.chiTietGioHang.findFirst({
      where: {
        MaGioHang: cart.MaGioHang,
        VoucherID: parseInt(voucherId, 10),
      }
    });

    if (existingItem) {
      await prisma.chiTietGioHang.delete({
        where: { MaCTGioHang: existingItem.MaCTGioHang }
      });
    }

    res.status(200).json({ message: 'Removed from cart successfully' });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const customerId = (req as any).user.IDTaiKhoan;
    if (!customerId) return res.status(401).json({ message: 'error.unauthorized' });

    const cart = await prisma.gioHang.findUnique({
      where: { IDTaiKhoan: customerId },
    });

    if (cart) {
      await prisma.chiTietGioHang.deleteMany({
        where: { MaGioHang: cart.MaGioHang }
      });
    }

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Server error:', error);
    console.error('Lỗi xóa giỏ hàng:', error);
    res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
  }
};
