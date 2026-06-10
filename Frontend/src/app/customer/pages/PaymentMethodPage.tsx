import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Shield, ChevronRight, Wallet, CreditCard, Landmark, Loader2, Lock } from "lucide-react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import { useCartStore } from "../../../store/useCartStore";
import { useAuth } from "../../auth/AuthContext";
import api from "../../../lib/api";
import { toast } from "sonner";
type PaymentMethod = "EWALLET" | "CARD" | "BANK";

export function PaymentMethodPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const { user } = useAuth();
  const { items, clearCart, getCartTotal, } = useCartStore();
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CARD");
  
  const [showGateway, setShowGateway] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const subtotal = getCartTotal();
  const processingFee = 800;
  const tax = subtotal * 0.08;
  const orderTotal = subtotal + processingFee + tax;

  useEffect(() => {
    if (!orderId && items.length === 0) {
      navigate("/cart");
    }
  }, [items, orderId, navigate]);

  useEffect(() => {
    if (!showGateway) return;
    setTimeLeft(300);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCancelPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showGateway]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCancelPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (createdOrderId) {
        await api.delete(`/orders/${createdOrderId}`);
      }
      toast.error(t('payment.failed_title'), {
        description: t('payment.failed_desc'),
      });
      setShowGateway(false);
      navigate("/checkout/review");
    } catch (error) {
      console.error("Cancel payment error:", error);
      toast.error(t('payment.failed_title'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (isProcessing || !createdOrderId) return;
    setIsProcessing(true);
    try {
      const res = await api.patch(`/orders/${createdOrderId}/payment/confirm`, {
        paymentMethod: selectedMethod,
      });
      if (res.status === 200) {
        toast.success(t('payment.success_title'), {
          description: t('payment.success_desc'),
        });
        
        localStorage.removeItem("checkout-info");
        setShowGateway(false);
        
        navigate(`/checkout/success?orderId=${createdOrderId}`);
        setTimeout(() => {
          clearCart();
        }, 300);
      } else {
        toast.error(t('payment.failed_title'));
      }
    } catch (error: any) {
      console.error("Confirm payment error:", error);
      toast.error(error.response?.data?.message || t('payment.failed_title'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      toast.error(t('payment.failed_title'));
      navigate("/cart");
      return;
    }
    
    setIsProcessing(true);
    try {
      const orderRes = await api.post("/orders", {
        items: items.map(item => ({
          voucherId: Number(item.id),
          quantity: item.quantity
        })),
        paymentMethod: selectedMethod
      });

      if (orderRes.data && orderRes.data.orderId) {
        setCreatedOrderId(orderRes.data.orderId);
        setShowGateway(true);
      } else {
        throw new Error("Cannot create order");
      }
    } catch (error) {
      console.error("Create order error:", error);
      toast.error("Tạo đơn hàng thất bại");
    } finally {
      setIsProcessing(false);
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

      {/* ============================================================ */}
      {/* Simulated Payment Gateway Dialog */}
      {/* ============================================================ */}
      <Dialog open={showGateway} onOpenChange={() => {}}>
        <DialogContent className="max-w-md p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
          {/* Gateway Header – adapts per payment method */}
          <div className={`px-6 pt-6 pb-4 text-white ${
            selectedMethod === "EWALLET"
              ? "bg-gradient-to-r from-pink-500 to-rose-500"
              : selectedMethod === "BANK"
              ? "bg-gradient-to-r from-blue-700 to-indigo-700"
              : "bg-gradient-to-r from-slate-800 to-slate-900"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {selectedMethod === "EWALLET" ? (
                  <Wallet className="w-6 h-6" />
                ) : selectedMethod === "BANK" ? (
                  <Landmark className="w-6 h-6" />
                ) : (
                  <CreditCard className="w-6 h-6" />
                )}
                <span className="font-bold text-sm uppercase tracking-widest">
                  {selectedMethod === "EWALLET" ? t('payment.gateway.ewallet_name') : selectedMethod === "BANK" ? t('payment.gateway.bank_name') : t('payment.gateway.card_name')}
                </span>
              </div>
              {/* Countdown Timer */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                timeLeft < 60 ? "bg-red-500/30 text-red-200 animate-pulse" : "bg-white/20 text-white"
              }`}>
                <Lock className="w-3.5 h-3.5" />
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Order info */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{t('payment.gateway.order_id_label')}</p>
              <p className="font-mono font-black text-lg tracking-wider">ORD-{createdOrderId}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-white/70 text-xs">{t('payment.gateway.total_label')}</p>
                <p className="font-black text-xl">{orderTotal.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          </div>

          {/* Gateway Body */}
          <div className="px-6 py-5">
            {/* Method-specific instruction */}
            {selectedMethod === "EWALLET" && (
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-4 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold text-pink-800 mb-1">{t('payment.gateway.ewallet_title')}</p>
                <p className="text-xs text-pink-600">{t('payment.gateway.ewallet_desc')}</p>
                <div className="mt-3 w-32 h-32 mx-auto bg-white border-2 border-pink-200 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-1 p-2 opacity-30">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div key={i} className={`w-full aspect-square rounded-sm ${Math.random() > 0.5 ? "bg-pink-800" : "bg-transparent"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-pink-400 mt-2">{t('payment.gateway.qr_simulated')}</p>
              </div>
            )}

            {selectedMethod === "BANK" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> {t('payment.gateway.bank_title')}
                </p>
                <div className="space-y-2">
                  {[
                    { label: t('payment.gateway.bank_name_label'), value: t('payment.gateway.bank_name_value') },
                    { label: t('payment.gateway.bank_account'), value: t('payment.gateway.bank_account_value') },
                    { label: t('payment.gateway.bank_holder'), value: t('payment.gateway.bank_holder_value') },
                    { label: t('payment.gateway.bank_note'), value: `ORD${createdOrderId}` },
                    { label: t('payment.gateway.bank_amount'), value: `${orderTotal.toLocaleString("vi-VN")}đ` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs py-1.5 border-b border-blue-100 last:border-0">
                      <span className="text-blue-600 font-medium">{row.label}:</span>
                      <span className="font-bold text-blue-900 font-mono">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod === "CARD" && (
              <div className="mb-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                  <div className="relative">
                    <div className="flex justify-between items-start mb-6">
                      <CreditCard className="w-8 h-8 text-white/70" />
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded font-mono">VISA</span>
                    </div>
                    <p className="font-mono text-lg tracking-[0.3em] text-white/90 mb-2">•••• •••• •••• 4242</p>
                    <div className="flex justify-between text-xs text-white/60">
                      <span>VOUCHER HUB DEMO</span>
                      <span>12/28</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
              <Lock className="w-3.5 h-3.5 shrink-0 text-green-600" />
              <span>{t('payment.gateway.ssl_note')}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400"
                onClick={handleCancelPayment}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : t('payment.gateway.cancel_btn')}
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {t('payment.gateway.processing')}</span>
                ) : (
                  t('payment.gateway.confirm_btn')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
