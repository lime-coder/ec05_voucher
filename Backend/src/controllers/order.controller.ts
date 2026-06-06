
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
        customerId,
        items,
        paymentMethod,
      } = req.body;

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

      // =====================
      // Tổng tiền
      // =====================
      let totalPrice = 0;

      // =====================
      // Validate voucher
      // =====================
      for (const item of items) {

        const voucher =
          await prisma.voucher.findUnique(
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
          return res
            .status(404)
            .json({
              message:
                "Voucher không tồn tại",
            });
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
          return res
            .status(400)
            .json({
              message:
                `${voucher.TenVoucher} không đủ số lượng`,
            });
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
        await prisma.donHang.create(
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

              TrangThaiDonHang:
                "COMPLETED",

              TrangThaiThanhToan:
                "PAID",
            },
          }
        );

      // =====================
      // Tạo chi tiết đơn hàng
      // =====================
      for (const item of items) {

        const voucher =
          await prisma.voucher.findUnique(
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
          await prisma.chiTietDonHang.create(
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
        await prisma.voucher.update(
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

          await prisma.maVoucher.create(
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
      // Thành công
      // =====================
      res.status(201).json({

        message:
          "Đặt hàng thành công",

        orderId:
          order.MaDonHang,
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message:
          "Lỗi tạo đơn hàng",
      });
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

      console.error(
        error
      );

      res.status(500).json({
        message:
          "Lỗi lấy orders",
      });
    }
  };

  export const getOrdersByCustomer =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const customerId =
        Number(
          req.params.customerId
        );

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

      console.error(error);

      res.status(500).json({
        message:
          "Lỗi lấy lịch sử đơn hàng",
      });
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

      res.json(order);

    } catch (error) {

      console.error(error);

      res.status(500).json({

        message:
          "Lỗi lấy chi tiết đơn hàng",
      });
    }
  };