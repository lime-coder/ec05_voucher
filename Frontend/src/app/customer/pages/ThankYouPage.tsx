import { Link, useSearchParams  } from "react-router";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../../shared/contexts/LanguageContext";

export function ThankYouPage() {
  const { t } = useLanguage();

  const [searchParams] =  useSearchParams();

  const orderId =  searchParams.get("orderId") || "N/A";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-border text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t('thanks.title')}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {t('thanks.desc')}
        </p>

        <div className="bg-secondary rounded-xl p-4 mb-8 flex items-center gap-4 text-left">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <p className="font-semibold text-foreground">{t('thanks.order_id').replace('{id}', orderId)}</p>
            <p className="text-sm text-muted-foreground">{t('thanks.view_details')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/orders">
            <Button className="w-full py-6 font-bold flex items-center justify-center gap-2">
              {t('thanks.view_history')} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full py-6 font-semibold flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> {t('thanks.back_home')}
            </Button>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
