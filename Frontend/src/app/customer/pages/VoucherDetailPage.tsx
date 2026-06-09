import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useCartStore } from "../../../store/useCartStore";
import { useAuth } from "../../auth/AuthContext";
import {
  Star,
  MapPin,
  ShoppingCart,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  Diamond,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";
import api from "../../../lib/api";
import { toast } from "sonner";


interface VoucherDetail {
  id: number;

  name: string;

  description: string;

  condition: string;

  refundPolicy: string;

  usageGuide: string;

  originalPrice: number;

  salePrice: number;

  quantity: number;

  sold: number;

  stock: number;

  image?: string;

  rating: number;

  reviewCount: number;

  category?: {
    id: number;
    name: string;
  };

  partner?: {
    id: number;
    name: string;
    avatar?: string;
    businessField?: string;
  };

  reviews: {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    reply?: string;
  }[];

  branches: {
    id: number;
    name: string;
    address: string;
    phone: string;
  }[];
}

export function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, } = useCartStore();
  const { t } = useLanguage();

  const [voucher, setVoucher] = useState<VoucherDetail | null>( null ); 
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = (type: "increment" | "decrement") => {
    setQuantity((prev) => {
      if (type === "increment") return Math.min(voucher?.stock || 1, prev + 1);
      return Math.max(1, prev - 1);
    });

    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        setQuantity((prev) => {
          if (type === "increment") return Math.min(voucher?.stock || 1, prev + 1);
          return Math.max(1, prev - 1);
        });
      }, 100);
    }, 400);
  };

  const stopHold = () => {
    if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdTimeoutRef.current = null;
    holdIntervalRef.current = null;
  };

  const [isAdding, setIsAdding] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {

    if (!user) {

      toast.error(
        t('auth.login_required') || "Vui lòng đăng nhập trước khi thêm vào giỏ hàng"
      );

      navigate("/login");

      return;
    }

    if (!voucher) return;

    if (isAdding) return;

    setIsAdding(true);

    // =====================
    // Add item thật
    // =====================
    addItem({
      id: String(
        voucher.id
      ),

      name:
        voucher.name,

      description:
        voucher.description ||
        "",

      price:
        Number(
          voucher.salePrice
        ),

      quantity,

    });

    // =====================
    // Animation giữ nguyên
    // =====================
    const button =
      e.currentTarget;

    const rect =
      button.getBoundingClientRect();

    const clone =
      button.cloneNode(
        true
      ) as HTMLElement;

    clone.style.position =
      "fixed";

    clone.style.left =
      `${rect.left}px`;

    clone.style.top =
      `${rect.top}px`;

    clone.style.width =
      `${rect.width}px`;

    clone.style.zIndex =
      "9999";

    clone.style.transition =
      "all 0.8s ease-in-out";

    document.body.appendChild(
      clone
    );

    setTimeout(() => {
      clone.style.transform =
        "translate(1000px,-500px) scale(0.2)";

      clone.style.opacity =
        "0";
    }, 50);

    setTimeout(() => {
      document.body.removeChild(
        clone
      );

      setIsAdding(false);
    }, 800);
  };




  
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchVoucher =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              `/vouchers/${id}`
            );

          const data =
            response.data;

          setVoucher(data);
        } catch (error) {
          console.error(
            "Fetch voucher error:",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    fetchVoucher();
  }, [id]);

  if (loading || !voucher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }


  const discountPercent =
    Number(
      voucher.originalPrice
    ) > 0
      ? Math.round(
          (
            (Number(
              voucher.originalPrice
            ) -
              Number(
                voucher.salePrice
              )) /
            Number(
              voucher.originalPrice
            )
          ) *
            100
        )
      : 0;

  const images = voucher.image ? voucher.image.split(',').map(url => url.startsWith('http') ? url : `http://localhost:5000${url}`) : ["https://placehold.co/600x400?text=Voucher"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1 max-w-[1440px] mx-auto px-6 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-foreground mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          {t('voucher.back_to_search')}
        </button>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <div className="relative rounded-xl overflow-hidden mb-4 group">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt="Voucher"
                className="w-full aspect-[4/3] object-cover transition-opacity duration-300"
              />
              <div className="absolute top-4 left-4 bg-[#FF4444] text-white px-3 py-1 rounded-md font-bold shadow-sm z-10">
                {t('voucher.best_seller')}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                  >
                    <ChevronLeft className="w-6 h-6 ml-[-2px]" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                  >
                    <ChevronRight className="w-6 h-6 mr-[-2px]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative rounded-lg overflow-hidden shrink-0 w-20 h-20 border-2 transition-all ${
                      selectedImageIndex === idx ? "border-primary opacity-100 ring-2 ring-primary ring-offset-1" : "border-transparent opacity-70 hover:opacity-100 hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div>
            {/* Category & Location */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full uppercase">
                {voucher.category?.name}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted">
                <MapPin className="w-4 h-4" />
                {t('voucher.multiple_locations')}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4">
              {voucher.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{voucher.rating}</span>
              </div>
              <button onClick={scrollToReviews} className="text-primary hover:underline">
                {t('voucher.see_all_reviews').replace( "{count}", String( voucher.reviewCount ) )}
              </button>
              <span className="text-muted">{t('voucher.sold').replace('{count}', String(voucher.sold))}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-primary">{voucher.salePrice.toLocaleString("vi-VN")}đ</span>
              <span className="text-xl text-muted line-through">{voucher.originalPrice.toLocaleString("vi-VN")}đ</span>
              <span className="px-3 py-1 bg-[#FF4444] text-white rounded-md font-bold">
                {t('voucher.off').replace('{percentage}', String(discountPercent))}
              </span>
            </div>
            <p className="text-sm text-muted mb-6">
              {t('voucher.price_includes_tax')}
            </p>

            {/* Stock Warning */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{t('voucher.stock_remaining')}</span>
                <span className="text-[#FF4444] font-semibold">{t('voucher.only_left').replace('{count}', String(voucher.stock))}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF4444] rounded-full" style={{ width: `${ voucher.quantity > 0 ? ( (voucher.sold / voucher.quantity) * 100 ) : 0 }%`, }} />
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">{t('voucher.quantity')}</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onMouseDown={() => startHold("decrement")}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold("decrement")}
                  onTouchEnd={stopHold}
                  className="w-10 h-10 border-2 border-border rounded-lg hover:border-primary transition-colors font-bold select-none"
                >
                  -
                </Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onMouseDown={() => startHold("increment")}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={() => startHold("increment")}
                  onTouchEnd={stopHold}
                  className="w-10 h-10 border-2 border-border rounded-lg hover:border-primary transition-colors font-bold select-none"
                >
                  +
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`py-6 border-2 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${
                  isAdding 
                    ? "border-green-500 text-green-600 bg-green-50" 
                    : "border-primary text-primary hover:bg-primary/10"
                }`}
              >
                {isAdding ? (
                  <>
                    <Check className="w-5 h-5 animate-in zoom-in" />
                    {t('voucher.added')}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    {t('voucher.add_to_cart')}
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  // =====================
                  // Chưa đăng nhập
                  // =====================
                  if (!user) {

                    toast.error(
                      t('auth.login_required') || "Vui lòng đăng nhập trước khi mua hàng"
                    );

                    navigate("/login");

                    return;
                  }
                  if (!voucher) return;

                  // =====================
                  // Add item thật
                  // =====================
                  addItem({
                    id: String(
                      voucher.id
                    ),

                    name:
                      voucher.name,

                    description:
                      voucher.description ||
                      "",

                    price:
                      Number(
                        voucher.salePrice
                      ),

                    quantity,

                  });

                  // =====================
                  // Đi tới cart
                  // =====================
                  navigate("/cart");
                }}

                className="py-6 bg-primary text-foreground hover:opacity-90 transition-colors font-bold cursor-pointer"
              >
                {t('voucher.buy_now')}
              </Button>
            </div>
          </div>
        </div>

        {/* Partner Info Card */}
        <div className="bg-white border-2 border-border/60 shadow-sm rounded-2xl p-6 md:p-8 mb-10 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full -z-0" />
          
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20 relative z-10 group-hover:scale-105 transition-transform shadow-sm">
            <Diamond className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1 relative z-10 w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
              <div>
                <Link to={`/brand/${voucher.partner?.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    {voucher.partner?.name}
                    <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />
                  </h3>
                </Link>
                <p className="text-sm text-primary font-semibold mt-1 uppercase tracking-wider">{t('voucher.premium_partner')}</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate( `/brand/${voucher.partner?.id}` )}
                className="border-primary/50 text-primary hover:bg-primary/10 shrink-0 font-bold px-6"
              >
                {t('voucher.visit_brand_store')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              {voucher.partner?.businessField}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex gap-8">
            {["description", "conditions", "branches", "policy"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold capitalize transition-colors relative ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab === "description" && t('voucher.tab.description')}
                {tab === "conditions" && t('voucher.tab.conditions')}
                {tab === "branches" && t('voucher.tab.branches')}
                {tab === "policy" && t('voucher.tab.policy')}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <h3 className="font-bold text-xl mb-4">{t('voucher.about_this')}</h3>
              <p className="text-muted mb-4">
                {voucher.description}
              </p>
              
            </div>
          )}

          {activeTab === "conditions" && (
            <div>
              <h3 className="font-bold text-xl mb-4">{t('voucher.terms')}</h3>
              <ul className="space-y-2 text-muted">
                <p className="text-muted"> {voucher.condition} </p>
              </ul>
            </div>
          )}

          {activeTab === "branches" && (
            <div>
              <h3 className="font-bold text-xl text-black mb-4">{t('voucher.tab.branches')}</h3>
              <div className="space-y-3 text-muted-foreground">
                {voucher.branches.map(
                (branch) => (
                  <div
                    key={branch.id}
                    className="border rounded-lg p-4"
                  >
                    <p className="font-semibold">
                      {branch.name}
                    </p>

                    <p>
                      {branch.address}
                    </p>

                    <p>
                      {branch.phone}
                    </p>
                  </div>
                )
              )}
            </div>
            </div>
          )}

          {activeTab === "policy" && (
            <div>
              <h3 className="font-bold text-xl mb-4">{t('voucher.refund_policy')}</h3>
              <p className="text-muted">
                {voucher.refundPolicy}
              </p>
            </div>
          )}
        </div>

        {/* Customer Reviews */}
        <div ref={reviewsRef} className="pt-16 mt-8 border-t-2 border-border scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{t('voucher.customer_reviews')}</h2>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold"> {voucher.rating} </span>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor( voucher.rating || 0 )
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">{t('voucher.based_on_reviews').replace( "{count}", String( voucher.reviewCount ) )}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-6 mb-6">
            {voucher.reviews?.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">U</span>
                  </div>

                  <div className="flex-1">
                    {/* Name & Rating */}
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold">User</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted">{new Date(review.createdAt).toLocaleDateString("vi-VN")}</span>
                      
                    </div>

                    {/* Review Text */}
                    <p className="text-muted mb-4">{review.comment}</p>

                    {/* Partner Response */}
                    {review.reply && (
                      <div className="bg-primary/10 border-l-4 border-primary pl-4 py-3 italic text-sm text-muted">
                        <p className="font-semibold text-foreground mb-1">
                          {t('voucher.response_from')} {voucher.partner?.name}:
                        </p>
                        {review.reply}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      </main>

          </div>
  );
}
