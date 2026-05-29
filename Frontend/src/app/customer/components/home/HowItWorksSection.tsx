import { Search, CreditCard, QrCode } from "lucide-react";
import { useLanguage } from "../../../shared/contexts/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLanguage();

  return (
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
  );
}
