import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../../shared/contexts/LanguageContext";
import { categories } from "../../../../data/mock/categories";

export function CategorySection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
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
  );
}
