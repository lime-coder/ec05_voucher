import { useState, useEffect } from 'react';
import { useNavigate } from "react-router";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@voucherhub/ui";
import Autoplay from "embla-carousel-autoplay";

export function MiddleBannerSection() {
  const navigate = useNavigate();
  const [activeBanners, setActiveBanners] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/content/banners')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const active = data
            .filter((b: any) => b.TrangThai === 'Đang hiển thị' && (b.ViTri === 'Homepage Middle' || b.ViTri === 'homepage_middle'))
            .sort((a: any, b: any) => a.ThuTu - b.ThuTu);
          setActiveBanners(active);
        }
      })
      .catch((err) => console.error('Fetch home banners error:', err));
  }, []);

  if (activeBanners.length === 0) return null;

  return (
    <section className="bg-background py-8">
      <div className="max-w-[1440px] mx-auto px-6 relative">
        <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 5000 })]}>
          <CarouselContent>
            {activeBanners.map((banner, idx) => (
              <CarouselItem key={banner.MaBanner || idx}>
                <div 
                  className="w-full relative rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => {
                    const target = banner?.LinkURL || '/search';
                    if (target.startsWith('http://') || target.startsWith('https://')) {
                      window.open(target, '_blank');
                    } else {
                      navigate(target);
                    }
                  }}
                >
                  <img
                    src={banner.HinhAnh}
                    alt={banner.TieuDe || "Middle Banner"}
                    className="w-full h-[200px] md:h-[300px] object-cover"
                  />
                  {banner.TieuDe && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <h3 className="text-white text-3xl font-bold px-4 text-center">{banner.TieuDe}</h3>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {activeBanners.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-white" />
              <CarouselNext className="right-4 bg-white" />
            </>
          )}
        </Carousel>
      </div>
    </section>
  );
}
