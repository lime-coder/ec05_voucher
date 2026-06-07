import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import * as LucideIcons from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../../shared/contexts/LanguageContext";

interface CategoryItem {
  id: number;
  name: string;
  moTa: string;
  vouchers: number;
  icon: string;
}

export function CategorySection() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [categories, setCategories] = useState<CategoryItem[]>([]);

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

  return (
    <section className="bg-secondary py-16">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{tText('Explore Categories', 'Khám phá danh mục')}</h2>
          <Button
            variant="link"
            onClick={() => navigate("/search")}
            className="text-primary hover:opacity-90 gap-1 p-0 h-auto font-normal text-base"
          >
            {tText('Browse All', 'Xem tất cả')} <LucideIcons.ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const IconComponent = getCategoryIconComponent(category.icon);
            const label = getCategoryLabel(category.name);
            
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/search?category=${category.id}`)}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl hover:shadow-lg transition-shadow border border-gray-100/50"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <span className="text-sm font-semibold text-center text-gray-800">
                  {label}
                </span>
                {category.vouchers > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {category.vouchers} {tText('vouchers', 'voucher')}
                  </span>
                )}
              </button>
            );
          })}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-6 text-gray-500">
              {tText('No categories found.', 'Không tìm thấy danh mục nào.')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
