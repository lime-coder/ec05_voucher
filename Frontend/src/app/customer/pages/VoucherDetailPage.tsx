import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Star,
  MapPin,
  ShoppingCart,
  Zap,
  Check,
  ChevronLeft,
  Diamond,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

const voucherImages = [
  "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const reviews = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: "SM",
    rating: 5,
    date: "May 15, 2026",
    verified: true,
    text: "Absolutely incredible experience! The massage therapist was highly skilled and the atmosphere was so relaxing. The voucher was such great value - saved almost 50% on this premium treatment. Will definitely be coming back!",
    partnerResponse:
      "Thank you so much for your kind words, Sarah! We're thrilled you enjoyed your experience with us. We look forward to welcoming you back soon.",
  },
  {
    id: 2,
    name: "Michael Chen",
    avatar: "MC",
    rating: 5,
    date: "May 10, 2026",
    verified: true,
    text: "Best spa treatment I've had in years. The facilities were pristine and the staff was incredibly professional. The hydro-aromatherapy portion was heavenly. Worth every penny!",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    avatar: "ER",
    rating: 4,
    date: "May 5, 2026",
    verified: true,
    text: "Great service and wonderful ambiance. The only minor issue was the wait time, but the quality of the treatment more than made up for it. Highly recommend this voucher!",
    partnerResponse:
      "We appreciate your feedback, Emma! We're working on improving our scheduling to minimize wait times. Thank you for your understanding and we hope to see you again.",
  },
];

const moreReviews = [
  {
    id: 4,
    name: "David Park",
    avatar: "DP",
    rating: 5,
    date: "April 28, 2026",
    verified: true,
    text: "The atmosphere was perfect. Soft lighting, soothing music, and the most skilled therapist I've ever had. I fell asleep during the hydro-aromatherapy and woke up feeling like a new person.",
  },
  {
    id: 5,
    name: "Lisa Wong",
    avatar: "LW",
    rating: 4,
    date: "April 20, 2026",
    verified: true,
    text: "Lovely experience overall! The essential oils used were absolutely divine. Only giving 4 stars because the facility was a bit crowded on a Saturday. Would recommend booking on weekdays.",
    partnerResponse: "Thank you Lisa! We agree that weekday visits offer a more tranquil experience. We're expanding our facilities to better accommodate weekend guests.",
  },
  {
    id: 6,
    name: "James Turner",
    avatar: "JT",
    rating: 5,
    date: "April 15, 2026",
    verified: true,
    text: "Best gift voucher I've ever purchased for my wife. She was absolutely thrilled. The staff went above and beyond to make her feel special. Highly recommend for anniversaries or birthdays.",
  },
];

export function VoucherDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [visibleReviews, setVisibleReviews] = useState(reviews);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isAdding) return;
    setIsAdding(true);

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const flyingDot = document.createElement("div");
    flyingDot.style.width = "24px";
    flyingDot.style.height = "24px";
    flyingDot.style.backgroundColor = "#F97316"; // Primary color
    flyingDot.style.borderRadius = "50%";
    flyingDot.style.position = "fixed";
    flyingDot.style.left = `${rect.left + rect.width / 2}px`;
    flyingDot.style.top = `${rect.top + rect.height / 2}px`;
    flyingDot.style.zIndex = "9999";
    flyingDot.style.boxShadow = "0 4px 12px rgba(249, 115, 22, 0.5)";
    flyingDot.style.transition = "all 0.8s cubic-bezier(0.2, 1, 0.3, 1)";
    
    document.body.appendChild(flyingDot);

    // Force reflow
    flyingDot.getBoundingClientRect();

    // Fly to top right (approximate position of cart icon in navbar)
    flyingDot.style.left = "calc(100vw - 120px)";
    flyingDot.style.top = "40px";
    flyingDot.style.transform = "scale(0.3)";
    flyingDot.style.opacity = "0";

    setTimeout(() => {
      if (document.body.contains(flyingDot)) {
        document.body.removeChild(flyingDot);
      }
      setIsAdding(false);
    }, 800);
  };

  const handleLoadMoreReviews = () => {
    setVisibleReviews((prev) => [...prev, ...moreReviews]);
    setHasMoreReviews(false);
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <div className="relative rounded-xl overflow-hidden mb-4">
              <img
                src={voucherImages[selectedImage]}
                alt="Voucher"
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#FF4444] text-white px-3 py-1 rounded-md font-bold">
                {t('voucher.best_seller')}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {voucherImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Details */}
          <div>
            {/* Category & Location */}
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full uppercase">
                SPA & WELLNESS
              </span>
              <div className="flex items-center gap-1 text-sm text-muted">
                <MapPin className="w-4 h-4" />
                {t('voucher.multiple_locations')}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4">
              Grand Bliss Royal Massage & Hydro-Aromatherapy (90 Min)
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">4.8</span>
              </div>
              <button onClick={scrollToReviews} className="text-primary hover:underline">
                {t('voucher.see_all_reviews').replace('{count}', '248')}
              </button>
              <span className="text-muted">{t('voucher.sold').replace('{count}', '1.2k')}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-primary">$129.00</span>
              <span className="text-xl text-muted line-through">$245.00</span>
              <span className="px-3 py-1 bg-[#FF4444] text-white rounded-md font-bold">
                {t('voucher.off').replace('{percentage}', '47')}
              </span>
            </div>
            <p className="text-sm text-muted mb-6">
              {t('voucher.price_includes_tax')}
            </p>

            {/* Stock Warning */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold">{t('voucher.stock_remaining')}</span>
                <span className="text-[#FF4444] font-semibold">{t('voucher.only_left').replace('{count}', '14')}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#FF4444] rounded-full" style={{ width: "15%" }} />
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-2">{t('voucher.quantity')}</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border-2 border-border rounded-lg hover:border-primary transition-colors font-bold"
                >
                  -
                </Button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border-2 border-border rounded-lg hover:border-primary transition-colors font-bold"
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
                onClick={() => navigate("/checkout/review")}
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
                <Link to="/brand/123" className="hover:text-primary transition-colors">
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    Ethereal Zen Wellness Spa
                    <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />
                  </h3>
                </Link>
                <p className="text-sm text-primary font-semibold mt-1 uppercase tracking-wider">{t('voucher.premium_partner')}</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate("/brand/123")}
                className="border-primary/50 text-primary hover:bg-primary/10 shrink-0 font-bold px-6"
              >
                {t('voucher.visit_brand_store')}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              Discover tranquility at Ethereal Zen Wellness Spa, where ancient healing
              traditions meet modern luxury. Our expert therapists provide personalized
              treatments designed to restore balance and rejuvenate your mind, body,
              and soul.
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
                Indulge in the ultimate relaxation experience with our Grand Bliss Royal
                Massage combined with Hydro-Aromatherapy. This 90-minute premium
                treatment is designed to melt away stress, ease muscle tension, and
                restore inner balance.
              </p>
              <p className="text-muted mb-6">
                Our highly trained therapists use a blend of traditional and modern
                techniques, incorporating aromatic essential oils and hydrotherapy
                elements to create a truly transformative wellness journey.
              </p>

              <h4 className="font-bold mb-4">{t('voucher.whats_included')}</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "90-minute full body massage",
                  "Hydro-aromatherapy session",
                  "Premium essential oil blend",
                  "Access to spa facilities",
                  "Complimentary herbal tea",
                  "Post-treatment consultation",
                  "Relaxation lounge access",
                  "Free parking",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "conditions" && (
            <div>
              <h3 className="font-bold text-xl mb-4">{t('voucher.terms')}</h3>
              <ul className="space-y-2 text-muted">
                <li>• Valid for 6 months from purchase date</li>
                <li>• Booking required at least 48 hours in advance</li>
                <li>• One voucher per person per visit</li>
                <li>• Cannot be combined with other promotions</li>
                <li>• Non-refundable after purchase</li>
              </ul>
            </div>
          )}

          {activeTab === "branches" && (
            <div>
              <h3 className="font-bold text-xl mb-4">{t('voucher.available_locations')}</h3>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Downtown Branch - 123 Main Street, CA 90001</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Beachside Branch - 456 Ocean Avenue, CA 90265</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Valley Branch - 789 Mountain Road, CA 91601</p>
              </div>
            </div>
          )}

          {activeTab === "policy" && (
            <div>
              <h3 className="font-bold text-xl mb-4">{t('voucher.cancellation_policy')}</h3>
              <p className="text-muted">
                Free cancellation up to 24 hours before appointment. Cancellations
                within 24 hours are subject to a 50% fee. No-shows are non-refundable.
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
                <span className="text-3xl font-bold">4.5</span>
                <div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted">{t('voucher.based_on_reviews').replace('{count}', '248')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-6 mb-6">
            {visibleReviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-6 last:border-0">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-primary">{review.avatar}</span>
                  </div>

                  <div className="flex-1">
                    {/* Name & Rating */}
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold">{review.name}</h4>
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
                      <span className="text-sm text-muted">{review.date}</span>
                      {review.verified && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <BadgeCheck className="w-4 h-4" />
                          {t('voucher.verified_purchase')}
                        </div>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-muted mb-4">{review.text}</p>

                    {/* Partner Response */}
                    {review.partnerResponse && (
                      <div className="bg-primary/10 border-l-4 border-primary pl-4 py-3 italic text-sm text-muted">
                        <p className="font-semibold text-foreground mb-1">
                          {t('voucher.response_from')} Ethereal Zen Wellness Spa:
                        </p>
                        {review.partnerResponse}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="flex justify-center">
            {hasMoreReviews ? (
              <Button 
                variant="outline" 
                onClick={handleLoadMoreReviews}
                className="px-8 py-6 border-2 font-semibold"
              >
                {t('voucher.load_more_reviews')}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">{t('voucher.all_reviews_loaded')}</p>
            )}
          </div>
        </div>
      </main>

          </div>
  );
}
