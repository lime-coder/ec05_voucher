import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, ChevronRight, Wallet, CreditCard, Landmark } from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { useCartStore } from "../../../store/useCartStore";
import { useAuth } from "../../auth/AuthContext";
type PaymentMethod = "EWALLET" | "CARD" | "BANK";

export function PaymentMethodPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, getCartTotal, } = useCartStore();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CARD");


  const subtotal = getCartTotal();
  const processingFee = 800;
  const tax = subtotal * 0.08;
  const orderTotal = subtotal + processingFee + tax;

  useEffect(() => {

    if (items.length === 0) {

      navigate("/cart");
    }

  }, [items, navigate]);

  const handlePayment =
    async () => {

      try {

        // =====================
        // Lấy buyer info
        // =====================
        const checkoutInfo =
          JSON.parse(
            localStorage.getItem(
              "checkout-info"
            ) || "{}"
          );

        // =====================
        // Validate
        // =====================
        if (
          !checkoutInfo.fullName ||
          !checkoutInfo.phone ||
          !checkoutInfo.email
        ) {

          alert(
            "Thiếu thông tin thanh toán"
          );

          navigate(
            "/checkout/review"
          );

          return;
        }

        // =====================
        // Call backend
        // =====================
        const response =
          await fetch(
            "/api/orders",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                customerId:
                  user?.IDTaiKhoan || 1,

                paymentMethod:
                  selectedMethod,

                buyerInfo:
                  checkoutInfo,

                items:
                  items.map(
                    (item) => ({
                      voucherId:
                        Number(
                          item.id
                        ),

                      quantity:
                        item.quantity,
                    })
                  ),
              }),
            }
          );

        const data =
          await response.json();

        console.log(
          "PAYMENT RESPONSE:",
          data
        );
        // =====================
        // Thành công
        // =====================
        if (

          response.ok
        ) {

          localStorage.removeItem(
            "checkout-info"
          );

          navigate(
            `/checkout/success?orderId=${data.orderId}`
          );

          setTimeout(() => {
            clearCart();
          }, 300);

        } else {

          alert(
            data.message ||
            "Thanh toán thất bại"
          );
        }

      } catch (error) {

        console.error(error);

        alert(
          "Lỗi thanh toán"
        );
      }
    };

  return (
    <div className="min-h-screen flex flex-col bg-background">

      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm flex items-center gap-2">
          <Link to="/cart" className="text-muted-foreground hover:text-foreground font-semibold">
            {t('cart.step.cart')}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link
            to="/checkout/review"
            className="text-muted-foreground hover:text-foreground font-semibold"
          >
            {t('cart.step.confirmation')}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-bold text-primary">{t('cart.step.payment')}</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-2">{t('payment.title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('payment.desc')}
        </p>

        {/* Main Layout - 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Payment Options */}
          <div className="flex-1 lg:w-[60%]">
            <div className="space-y-4 mb-6">
              {/* E-wallet Option */}
              <label
                className={`block border-2 rounded-lg p-6 cursor-pointer transition-all ${selectedMethod === "EWALLET"
                    ? "border-primary bg-secondary"
                    : "border-border bg-white hover:border-muted"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="EWALLET"
                    checked={selectedMethod === "EWALLET"}
                    onChange={() => setSelectedMethod("EWALLET")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-primary">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg">{t('payment.ewallet')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('payment.ewallet_desc')}
                    </p>
                  </div>
                </div>
              </label>

              {/* Credit/Debit Card Option */}
              <label
                className={`block border-2 rounded-lg p-6 cursor-pointer transition-all ${selectedMethod === "CARD"
                    ? "border-primary bg-secondary"
                    : "border-border bg-white hover:border-muted"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={selectedMethod === "CARD"}
                    onChange={() => setSelectedMethod("CARD")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg">{t('payment.card')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('payment.card_desc')}
                    </p>
                  </div>
                </div>
              </label>

              {/* Bank Transfer Option */}
              <label
                className={`block border-2 rounded-lg p-6 cursor-pointer transition-all ${selectedMethod === "BANK"
                    ? "border-primary bg-secondary"
                    : "border-border bg-white hover:border-muted"
                  }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK"
                    checked={selectedMethod === "BANK"}
                    onChange={() => setSelectedMethod("BANK")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-primary">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg">{t('payment.bank')}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('payment.bank_desc')}
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Security Note */}
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-white">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('payment.security_note')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-[35%]">
            <div className="border border-border rounded-lg p-6 bg-white">
              <h3 className="font-bold mb-4">{t('cart.order_summary')}</h3>

              {/* Items List */}
              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <p className="text-sm font-semibold text-muted-foreground">{t('payment.items_count').replace('{count}', String(items.length))}</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}:</span>
                    <span className="font-semibold">
                      {item.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-semibold">{subtotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('review.processing_fee')}</span>
                  <span className="font-semibold">
                    {processingFee.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('payment.tax_vat')}</span>
                  <span className="font-semibold">{tax.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{t('payment.order_total')}</span>
                  <span className="font-black text-3xl">
                    {orderTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full py-6 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-colors mb-3"
              >
                {t('payment.confirm')}
              </Button>

              <Link
                to="/checkout/review"
                className="block text-center text-sm text-primary hover:underline mb-4"
              >
                {t('payment.back_to_order')}
              </Link>

              <div className="text-center text-sm text-muted-foreground">
                {t('payment.need_help')}{" "}
                <a href="/not-implemented" className="font-bold text-foreground hover:underline">
                  {t('payment.contact_support')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
