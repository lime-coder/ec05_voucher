import { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import { Clock } from "lucide-react";
import { Button, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@voucherhub/ui";
import Autoplay from "embla-carousel-autoplay";
import { useLanguage } from "../../../shared/contexts/LanguageContext";

interface HeroSectionProps {
  timeLeft: { hours: number; minutes: number; seconds: number };
}

export function HeroSection({ timeLeft }: HeroSectionProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeBanners, setActiveBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/content/banners')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const active = data
            .filter((b: any) => b.TrangThai === 'Đang hiển thị' && (!b.ViTri || b.ViTri === 'Homepage Top' || b.ViTri === ''))
            .sort((a: any, b: any) => a.ThuTu - b.ThuTu);
          setActiveBanners(active);
        }
      })
      .catch((err) => console.error('Fetch home banners error:', err));
  }, []);

  return (
    <section className="bg-white relative z-10 shadow-sm border-b border-gray-100 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 pt-8 pb-16 relative">
        <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
          <CarouselContent>
            {activeBanners.length > 0 ? activeBanners.map((activeBanner, idx) => (
              <CarouselItem key={activeBanner.MaBanner || idx}>
                <div className="grid lg:grid-cols-2 gap-12 items-center px-4 md:px-12">
                  {/* Left Column - Text */}
                  <div>
                    <div className="inline-block px-4 py-1 border-2 border-primary text-primary rounded-full text-sm font-semibold mb-6">
                      {t('home.summer_sale')}
                    </div>
                    
                    <h1 className="text-5xl font-bold mb-4 leading-tight">
                      {activeBanner.TieuDe}
                    </h1>
                    
                    <p className="text-lg text-muted mb-8">
                      {t('home.hero_desc')}
                    </p>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={() => {
                          const target = activeBanner?.LinkURL || '/search';
                          if (target.startsWith('http://') || target.startsWith('https://')) {
                            window.open(target, '_blank');
                          } else {
                            navigate(target);
                          }
                        }}
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
                      src={activeBanner.HinhAnh || "https://images.unsplash.com/photo-1771508558500-f410039d7fc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwZGluaW5nJTIwZm9vZCUyMGV4cGVyaWVuY2V8ZW58MXx8fHwxNzc5MzU5NTg3fDA&ixlib=rb-4.1.0&q=80&w=1080"}
                      alt={activeBanner.TieuDe || "Premium dining experience"}
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
              </CarouselItem>
            )) : (
              <CarouselItem>
                <div className="grid lg:grid-cols-2 gap-12 items-center px-4 md:px-12">
                  {/* Left Column - Text */}
                  <div>
                    <div className="inline-block px-4 py-1 border-2 border-primary text-primary rounded-full text-sm font-semibold mb-6">
                      {t('home.summer_sale')}
                    </div>
                    
                    <h1 className="text-5xl font-bold mb-4 leading-tight">
                      <>
                        {t('home.unbeatable_deals')}{" "}
                        <span className="text-primary">{t('home.premium_experiences')}</span>
                      </>
                    </h1>
                    
                    <p className="text-lg text-muted mb-8">
                      {t('home.hero_desc')}
                    </p>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={() => navigate('/search')}
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
              </CarouselItem>
            )}
          </CarouselContent>
          {activeBanners.length > 1 && (
            <>
              <CarouselPrevious className="left-2 bg-white" />
              <CarouselNext className="right-2 bg-white" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}
