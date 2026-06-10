
import {
  Request,
  Response,
} from "express";

import prisma from "../config/db";

import { nanoid }
from "nanoid";

// =========================
// Tạo đơn hàng
// =========================
export const createOrder =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const {
        items,
        paymentMethod,
      } = req.body;

      const customerId = (req as any).user?.IDTaiKhoan;
      if (!customerId) return res.status(401).json({ message: "Unauthorized" });

      // =====================
      // Validate cart
      // =====================
      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res
          .status(400)
          .json({
            message:
              "Giỏ hàng trống",
          });
      }

      await prisma.$transaction(async (tx) => {
        // =====================
        // Tổng tiền
        // =====================
        let totalPrice = 0;

        // =====================
        // Validate voucher
        // =====================
        for (const item of items) {

          const voucher =
            await tx.voucher.findUnique(
              {
                where: {
                  VoucherID:
                    Number(
                      item.voucherId
                    ),
                },
              }
            );

          // Voucher không tồn tại
          if (!voucher) {
            throw new Error(`404:Voucher không tồn tại`);
          }

          // Stock thật
          const stock =
            Number(
              voucher.SoLuongChoPhep
            ) -
            Number(
              voucher.SoLuongDaBan || 0
            );

          // Không đủ số lượng
          if (
            stock <
            Number(
              item.quantity
            )
          ) {
            throw new Error(`400:${voucher.TenVoucher} không đủ số lượng`);
          }

          // Tổng tiền
          totalPrice +=
            Number(
              voucher.GiaBan
            ) *
            Number(
              item.quantity
            );
        }

        // =====================
        // Tạo đơn hàng
        // =====================
        const order =
          await tx.donHang.create(
            {
              data: {

                IDTaiKhoan:
                  Number(
                    customerId
                  ),

                TongTien:
                  totalPrice,

                ThoiGianThanhToan:
                  new Date(),

                PhuongThucThanhToan:
                  paymentMethod ||
                  "COD",

                TrangThaiDonHang: 'Hoàn tất',

                TrangThaiThanhToan: 'Đã thanh toán',
              },
            }
          );

        // =====================
        // Tạo chi tiết đơn hàng
        // =====================
        for (const item of items) {

          const voucher =
            await tx.voucher.findUnique(
              {
                where: {
                  VoucherID:
                    Number(
                      item.voucherId
                    ),
                },
              }
            );

          if (!voucher)
            continue;

          // Thành tiền
          const thanhTien =
            Number(
              voucher.GiaBan
            ) *
            Number(
              item.quantity
            );

          // =====================
          // Tạo chi tiết đơn hàng
          // =====================
          const orderDetail =
            await tx.chiTietDonHang.create(
              {
                data: {

                  MaDonHang:
                    order.MaDonHang,

                  VoucherID:
                    voucher.VoucherID,

                  SoLuongMua:
                    Number(
                      item.quantity
                    ),

                  DonGia:
                    Number(
                      voucher.GiaBan
                    ),

                  ThanhTien:
                    thanhTien,
                },
              }
            );

          // =====================
          // Update sold
          // =====================
          await tx.voucher.update(
            {
              where: {
                VoucherID:
                  voucher.VoucherID,
              },

              data: {
                SoLuongDaBan: {
                  increment:
                    Number(
                      item.quantity
                    ),
                },
              },
            }
          );

          // =====================
          // Tạo mã voucher
          // =====================
          for (
            let i = 0;
            i <
            Number(
              item.quantity
            );
            i++
          ) {

            await tx.maVoucher.create(
              {
                data: {

                  SoMaVoucher:
                    nanoid(12),

                  MaCTDonHang:
                    orderDetail.MaCTDonHang,

                  TrangThaiSuDung:
                    "Chưa sử dụng",

                  ThoiDiemPhatHanh:
                    new Date(),
                },
              }
            );
          }
        }

        // =====================
        // Clear Cart
        // =====================
        const cart = await tx.gioHang.findUnique({
          where: { IDTaiKhoan: Number(customerId) },
        });
        if (cart) {
          await tx.chiTietGioHang.deleteMany({
            where: { MaGioHang: cart.MaGioHang },
          });
        }

        // =====================
        // Thành công
        // =====================
        res.status(201).json({

          message:
            "Đặt hàng thành công",

          orderId:
            order.MaDonHang,
        });
      }); // end transaction

    } catch (error: any) {
    console.error('Server error:', error);

      console.error(error);

      if (error.message && error.message.includes(':')) {
        const parts = error.message.split(':');
        if (parts.length >= 2) {
          const status = parseInt(parts[0], 10);
          if (!isNaN(status)) {
            return res.status(status).json({ message: parts.slice(1).join(':') });
          }
        }
      }

      res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
    }
  };

export const getOrders =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const orders =
        await prisma.donHang.findMany({

          include: {

            ChiTietDonHangs: {

              include: {
                Voucher: true,
              },
            },
          },

          orderBy: {
            ThoiGianThanhToan:
              "desc",
          },
        });

      res.json(
        orders
      );

    } catch (error) {
    console.error('Server error:', error);

      console.error(
        error
      );

      res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
    }
  };

  export const getOrdersByCustomer =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const customerId = (req as any).user?.IDTaiKhoan;
      if (!customerId) return res.status(401).json({ message: "Unauthorized" });

      const orders =
        await prisma.donHang.findMany({
          where: {
            IDTaiKhoan:
              customerId,
          },

          include: {

            ChiTietDonHangs: {

              include: {
                Voucher: true,
              },
            },
          },

          orderBy: {
            ThoiGianThanhToan:
              "desc",
          },
        });

      res.json(
        orders
      );

    } catch (error) {
    console.error('Server error:', error);

      console.error(error);

      res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
    }
  };

  export const getOrderDetail =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const orderId =
        Number(
          req.params.id
        );

      const order =
        await prisma.donHang.findUnique({

          where: {
            MaDonHang:
              orderId,
          },

          include: {

            ChiTietDonHangs: {

              include: {

                Voucher: true,

                MaVouchers: true,
              },
            },
          },
        });

      if (!order) {
        return res.status(404).json({
          message:
            "Không tìm thấy đơn hàng",
        });
      }

      if (order.ChiTietDonHangs) {
        order.ChiTietDonHangs.forEach((ct: any) => {
          if (ct.MaVouchers) {
            ct.MaVouchers.forEach((mv: any) => {
              if (mv.ThoiDiemPhatHanh) {
                const date = new Date(mv.ThoiDiemPhatHanh);
                date.setDate(date.getDate() + 30);
                mv.NgayHetHan = date.toISOString().split('T')[0];
              }
            });
          }
        });
      }

      res.json(order);

    } catch (error) {
    console.error('Server error:', error);

      console.error(error);

      res.status(500).json({ errorCode: 'ERR_500', message: 'An unknown error occurred. Please contact support.', details: error instanceof Error ? error.message : String(error) });
    }
  };

export const getOrderDetailById =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const id =
        Number(
          req.params.id
        );

      // lấy theo MaCTDonHang
      const detail =
        await prisma.chiTietDonHang.findUnique({
          where: {
            MaCTDonHang: id,
          },
          include: {
            Voucher: {
              include: {
                DoiTac: true,
              },
            },
            MaVouchers: true,
            DonHang: true,
          },
        });

      if (!detail) {

        return res
          .status(404)
          .json({
            message:
              "Không tìm thấy voucher",
          });
      }

      return res.json(
        detail
      );

    } catch (error) {
    console.error('Server error:', error);

      console.error(error);

      return res
        .status(500)
        .json({
          message:
            "Server error",
        });
    }
  };

