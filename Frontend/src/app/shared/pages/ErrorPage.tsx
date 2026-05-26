import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@voucherhub/ui";
import { useLanguage } from "../contexts/LanguageContext";

export function ErrorPage() {
  const error = useRouteError();
  const { t } = useLanguage();

  let title = t('error.title_default');
  let message = t('error.message_default');
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      is404 = true;
      title = t('error.title_404');
      message = t('error.message_404');
    } else {
      title = `${error.status} Error`;
      message = error.statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border max-w-lg w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {is404 ? t('error.oops_404') : title}
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full sm:w-auto font-semibold flex items-center justify-center gap-2 py-6 px-6">
            <RotateCcw className="w-4 h-4" /> {t('error.try_again')}
          </Button>
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto font-bold flex items-center justify-center gap-2 py-6 px-6 bg-primary text-primary-foreground hover:opacity-90">
              <Home className="w-4 h-4" /> {t('error.back_to_home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
