import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import * as LucideIcons from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../../shared/contexts/LanguageContext";

interface CategoryItem {
  id: number;
  name: string;
  moTa: string;
  vouchers: number;
  activeVouchers?: number;
  icon: string;
}

export function CategorySection() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/content/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error('Fetch categories error:', err));
  }, []);

  const getCategoryIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Tag;
  };

  const getCategoryLabel = (name: string) => {
    const normalized = name.toLowerCase().trim();
    if (normalized === 'ẩm thực' || normalized === 'ăn uống' || normalized === 'food') {
      return tText('Food & Dining', 'Ẩm thực');
    }
    if (normalized === 'du lịch' || normalized === 'travel') {
      return tText('Travel', 'Du lịch');
    }
    if (normalized === 'làm đẹp' || normalized === 'spa' || normalized === 'beauty' || normalized === 'sức khỏe') {
      return tText('Spa & Beauty', 'Spa & Làm đẹp');
    }
    if (normalized === 'giải trí' || normalized === 'entertainment') {
      return tText('Entertainment', 'Giải trí');
    }
    if (normalized === 'thể thao' || normalized === 'thể hình' || normalized === 'fitness' || normalized === 'gym') {
      return tText('Fitness', 'Thể hình');
    }
    if (normalized === 'giáo dục' || normalized === 'education' || normalized === 'học tập') {
      return tText('Education', 'Giáo dục');
    }
    return name;
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -488, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 488, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-secondary py-16">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-center mb-8 max-w-[1196px] mx-auto">
          <h2 className="text-3xl font-bold">{tText('Explore Categories', 'Khám phá danh mục')}</h2>
          <Button
            variant="link"
            onClick={() => navigate("/search")}
            className="text-primary hover:opacity-90 gap-1 p-0 h-auto font-normal text-base"
          >
            {tText('Browse All', 'Xem tất cả')} <LucideIcons.ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="max-w-[1196px] mx-auto relative group">
          <button
            onClick={scrollLeft}
            className="absolute -left-16 top-[45%] -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all z-10 hidden xl:flex"
          >
            <LucideIcons.ChevronLeft className="w-6 h-6" />
          </button>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto mx-auto max-w-full w-max gap-6 pb-6 pt-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {categories.map((category) => {
              const IconComponent = getCategoryIconComponent(category.icon);
              const label = getCategoryLabel(category.name);
              
              return (
                <button
                  key={category.id}
                  onClick={() => navigate(`/search?category=${category.id}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-4 p-8 bg-white rounded-2xl hover:shadow-xl transition-shadow border border-gray-100/50 w-[220px] snap-start"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-10 h-10 text-primary" />
                  </div>
                  <span className="text-base font-bold text-center text-gray-800">
                    {label}
                  </span>
                  {category.activeVouchers !== undefined && category.activeVouchers > 0 && (
                    <span className="text-[10px] text-gray-400 font-medium">
                      {category.activeVouchers} {tText('vouchers', 'voucher')}
                    </span>
                  )}
                </button>
              );
            })}
            {categories.length === 0 && (
              <div className="w-full text-center py-6 text-gray-500">
                {tText('No categories found.', 'Không tìm thấy danh mục nào.')}
              </div>
            )}
          </div>

          <button
            onClick={scrollRight}
            className="absolute -right-16 top-[45%] -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all z-10 hidden xl:flex"
          >
            <LucideIcons.ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
