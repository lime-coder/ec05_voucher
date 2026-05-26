import { VoucherCard, Voucher } from "../components/VoucherCard";
import { useNavigate } from "react-router";
import {
  UtensilsCrossed,
  Plane,
  Sparkles,
  Tv,
  Dumbbell,
  Car,
  Clock,
  ArrowRight,
  Search,
  CreditCard,
  QrCode
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

const categories = [
  { icon: UtensilsCrossed, labelKey: "home.category.food" },
  { icon: Plane, labelKey: "home.category.travel" },
  { icon: Sparkles, labelKey: "home.category.spa" },
  { icon: Tv, labelKey: "home.category.entertainment" },
  { icon: Dumbbell, labelKey: "home.category.fitness" },
  { icon: Car, labelKey: "home.category.automotive" },
];

const flashSaleVouchers: Voucher[] = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "FOOD",
    name: "Premium Weekend Seafood Buffet for Two",
    partner: "The Grand Waterfront Hotel",
    price: 89,
    originalPrice: 178,
    discount: 50,
    flashDeal: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1630595633877-9918ee257288?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB3ZWxsbmVzcyUyMG1hc3NhZ2UlMjB0cmVhdG1lbnR8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    category: "SPA",
    name: "Grand Bliss Royal Massage & Hydro-Aromatherapy (90 Min)",
    partner: "Ethereal Zen Wellness Spa",
    price: 129,
    originalPrice: 245,
    discount: 47,
    flashDeal: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1762742316793-b1845065429a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc29ydCUyMHZhY2F0aW9uJTIwdHJhdmVsfGVufDF8fHx8MTc3OTM1OTU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "TRAVEL",
    name: "3 Days 2 Nights Resort Package with Breakfast",
    partner: "Paradise Beach Resort & Spa",
    price: 299,
    originalPrice: 599,
    discount: 50,
    flashDeal: true,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwZ3ltJTIwd29ya291dCUyMGV4ZXJjaXNlfGVufDF8fHx8MTc3OTM1OTU4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    category: "FITNESS",
    name: "1-Month Premium Gym Membership with Personal Training",
    partner: "FitZone Performance Studio",
    price: 79,
    originalPrice: 199,
    discount: 60,
    flashDeal: true,
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 22,
    seconds: 45,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white relative z-10 shadow-sm border-b border-gray-100">
          <div className="max-w-[1440px] mx-auto px-6 pt-8 pb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div>
              <div className="inline-block px-4 py-1 border-2 border-primary text-primary rounded-full text-sm font-semibold mb-6">
                {t('home.summer_sale')}
              </div>
              
              <h1 className="text-5xl font-bold mb-4">
                {t('home.unbeatable_deals')}{" "}
                <span className="text-primary">{t('home.premium_experiences')}</span>
              </h1>
              
              <p className="text-lg text-muted mb-8">
                {t('home.hero_desc')}
              </p>
              
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/search")}
                  className="bg-primary hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 rounded-lg"
                >
                  {t('home.explore_deals')}
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-6 rounded-lg font-semibold border-2"
                >
                  {t('home.how_it_works')}
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Premium dining experience"
                className="rounded-2xl shadow-2xl w-full max-h-[480px] object-cover"
              />
              
              {/* Floating countdown card */}
              <div className="absolute bottom-6 right-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#FF4444]" />
                <div>
                  <p className="text-xs text-muted">{t('home.flash_sale_ends')}</p>
                  <p className="text-lg font-bold text-foreground">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gray-50 py-16 relative z-0">
          <div className="max-w-[1440px] mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-3">{t('home.how_it_works.title')}</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('home.how_it_works.desc')}
            </p>
            <div className="grid md:grid-cols-3 gap-6 relative">

              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-border mb-4 text-primary z-10 relative">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('home.step1.title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step1.desc')}
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-border mb-4 text-primary z-10 relative">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('home.step2.title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step2.desc')}
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-border mb-4 text-primary z-10 relative">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">{t('home.step3.title')}</h3>
                <p className="text-muted-foreground">
                  {t('home.step3.desc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Categories */}
        <section className="bg-secondary py-16">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">{t('home.explore_categories')}</h2>
              <Button
                variant="link"
                onClick={() => navigate("/search")}
                className="text-primary hover:opacity-90 gap-1 p-0 h-auto font-normal text-base"
              >
                {t('home.browse_all')} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => navigate("/search")}
                  className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <category.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-center">
                    {t(category.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Flash Sale Vouchers */}
        <section className="max-w-[1440px] mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1 h-8 bg-[#FF4444]" />
              <h2 className="text-3xl font-bold">{t('home.flash_sale_vouchers')}</h2>
              <div className="flex items-center gap-2 text-[#FF4444]">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  {t('home.ends_in')} {timeLeft.hours}h {timeLeft.minutes}m
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/search")}
              className="border-2 font-semibold"
            >
              {t('home.view_all_offers')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleVouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
