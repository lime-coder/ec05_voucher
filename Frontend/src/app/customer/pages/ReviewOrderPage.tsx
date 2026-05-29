import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertTriangle, CreditCard, Lock, ChevronRight } from "lucide-react";
import { Button, Input } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

import { useCartStore } from "../../../store/useCartStore";

export function ReviewOrderPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });

  const { items: vouchers, getCartTotal } = useCartStore();

  const subtotal = getCartTotal();
  const processingFee = 12.5;
  const tax = 45.0;
  const grandTotal = subtotal + processingFee + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          <span className="font-bold text-primary">{t('cart.step.confirmation')}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-semibold">{t('cart.step.payment')}</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-2 text-foreground">
          {t('review.title')}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          {t('review.desc')}
        </p>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Column 1 - Buyer Information */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold">
                {t('review.step1')}
              </span>
              <h3 className="font-bold">{t('review.buyer_info')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('review.full_name')}
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="e.g. Alexander Hamilton"
                  className="bg-input-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('review.phone')}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="bg-input-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('review.email')}
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alexander@treasury.gov"
                  className="bg-input-background"
                />
              </div>
            </div>
          </div>

          {/* Column 2 - Review Vouchers */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold">
                {t('review.step2')}
              </span>
              <h3 className="font-bold">{t('review.review_vouchers')}</h3>
            </div>

            <div className="border border-border rounded-lg p-4">
              <div className="space-y-4">
                {vouchers.map((voucher, index) => (
                  <div key={voucher.id}>
                    {index > 0 && <div className="border-t border-border my-4" />}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{voucher.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {voucher.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {t('review.per_item').replace('{price}', voucher.price.toFixed(2))}
                        </p>
                        <span className="inline-block mt-1 bg-secondary px-2 py-1 rounded text-xs font-semibold">
                          {t('review.qty').replace('{qty}', String(voucher.quantity))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-[#F59E0B]" />
                  <p>
                    {t('review.warning')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 - Total & Pay */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold">
                {t('review.step3')}
              </span>
              <h3 className="font-bold">{t('review.total_pay')}</h3>
            </div>

            <div className="border border-border rounded-lg p-6">
              <h4 className="font-bold mb-4">{t('cart.order_summary')}</h4>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('review.processing_fee')}</span>
                  <span className="font-semibold">
                    ${processingFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('review.tax_calc')}</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold">{t('review.grand_total')}</span>
                  <span className="font-black text-3xl">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navigate("/checkout/payment")}
                className="w-full py-6 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-colors mb-3 flex items-center justify-center gap-2"
              >
                {t('review.pay_now')} <CreditCard className="w-5 h-5" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mb-4 flex items-center justify-center gap-1">
                <Lock className="w-4 h-4" /> {t('review.secure')}
              </p>

              <Link
                to="/cart"
                className="block text-center text-sm text-primary hover:underline"
              >
                {t('review.return_cart')}
              </Link>
            </div>
          </div>
        </div>

        {/* Final Verification Banner */}
        <div className="border border-border bg-secondary/30 rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold mb-2">{t('review.final_verification')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('review.final_verification_desc')}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-2 border border-border rounded text-xs font-semibold bg-white">
                {t('review.ssl')}
              </div>
              <div className="px-3 py-2 border border-border rounded text-xs font-semibold bg-white">
                {t('review.trust')}
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
