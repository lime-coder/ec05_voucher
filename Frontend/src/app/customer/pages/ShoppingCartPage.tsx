import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, ShoppingCart as CartIcon, Clock, RefreshCw, Zap, ChevronRight } from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export function ShoppingCartPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Summer Getaway Deluxe",
      description: "Valid for 2 Nights at Riverside Resort",
      price: 249.0,
      quantity: 1,
    },
    {
      id: "2",
      name: "City Dining Experience",
      description: "Premium 5-Course Meal at Skyline Restaurant",
      price: 85.5,
      quantity: 2,
    },
    {
      id: "3",
      name: "Extreme Spa Package",
      description: "Full Day Wellness Treatment with Massage",
      price: 120.0,
      quantity: 1,
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) => {
      const itemToUpdate = items.find((item) => item.id === id);
      if (!itemToUpdate) return items;

      if (itemToUpdate.quantity + delta <= 0) {
        setItemToDelete(id);
        return items;
      }

      return items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
      );
    });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setCartItems((items) => items.filter((item) => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const platformFee = 2.5;
  const total = subtotal + tax + platformFee;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Breadcrumb / Step Indicator */}
        <div className="mb-6 text-sm flex items-center gap-2">
          <span className="font-bold text-foreground">{t('cart.step.cart')}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-semibold">{t('cart.step.confirmation')}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground font-semibold">{t('cart.step.payment')}</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          {t('cart.title')}
        </h1>

        {/* Main Layout - 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Cart Items */}
          <div className="flex-1 lg:w-[65%]">
            {/* Header Row */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm">
                {t('cart.items_in_cart').replace('{count}', String(cartItems.length))}
              </h3>
              <Button
                variant="ghost"
                onClick={clearAll}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {t('cart.clear_all')}
              </Button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.length === 0 ? (
                <div className="border border-border rounded-lg p-12 text-center">
                  <CartIcon className="w-16 h-16 mx-auto mb-4 text-muted" />
                  <p className="text-muted">{t('cart.empty')}</p>
                  <Link
                    to="/search"
                    className="inline-block mt-4 text-primary hover:underline"
                  >
                    {t('cart.continue_shopping')}
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-border rounded-lg p-4 flex items-center gap-4"
                  >
                    {/* Icon Placeholder */}
                    <div className="w-16 h-16 flex-shrink-0 border border-border rounded flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <Link to={`/voucher/${item.id}`} className="hover:text-primary transition-colors">
                        <h4 className="font-bold mb-1">{item.name}</h4>
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>

                    {/* Price */}
                    <div className="font-bold text-lg">
                      ${item.price.toFixed(2)}
                    </div>

                    {/* Quantity Control */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded"
                      >
                        +
                      </Button>
                    </div>


                  </div>
                ))
              )}
            </div>

            {/* Info Box */}
            {cartItems.length > 0 && (
              <div className="border border-border rounded-lg p-6 grid md:grid-cols-2 gap-6 bg-secondary/30">
                <div>
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-1"><RefreshCw className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold mb-1">{t('cart.easy_returns')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('cart.easy_returns_desc')}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start gap-3">
                    <div className="text-primary mt-1"><Zap className="w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold mb-1">{t('cart.instant_delivery')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t('cart.instant_delivery_desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:w-[30%]">
              <div className="border border-border rounded-lg p-6 sticky top-24">
                <h3 className="font-bold mb-4">{t('cart.order_summary')}</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      {t('cart.tax')}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.platform_fee')}</span>
                    <span className="font-semibold">
                      ${platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">
                      {t('cart.estimated_total')}
                    </span>
                    <span className="font-bold text-2xl">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/checkout/review")}
                  className="w-full py-6 bg-primary text-primary-foreground font-bold hover:opacity-90 transition-colors mb-3"
                >
                  {t('cart.checkout')}
                </Button>

                <p className="text-xs text-center text-muted-foreground mb-4">
                  {t('cart.secure_checkout')}
                </p>

                <div>
                  <p className="text-xs font-semibold text-muted mb-2">
                    {t('cart.accepted_payments')}
                  </p>
                  <div className="flex gap-2">
                    {["VISA", "MC", "AMEX", "PP"].map((brand) => (
                      <div
                        key={brand}
                        className="flex-1 border border-border rounded px-2 py-1 text-center text-xs font-semibold"
                      >
                        {brand}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t('cart.remove_item.title')}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {t('cart.remove_item.desc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={cancelDelete} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button onClick={confirmDelete} className="flex-1 bg-destructive text-white hover:bg-destructive/90">
                  {t('cart.remove')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
