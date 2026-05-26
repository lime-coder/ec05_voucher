import { Globe, Moon, X } from 'lucide-react';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useEffect } from 'react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
  const { t, language, setLanguage } = useLanguage();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Darker background overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">{t('header.partner.settings') || 'Settings'}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> {t('settings.language')}
            </h2>
            <div className="space-y-4">
              <div 
                onClick={() => { setLanguage('en'); onClose(); }}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${language === 'en' ? 'bg-secondary border-primary' : 'hover:bg-secondary'}`}
              >
                <div>
                  <p className="font-semibold text-foreground">{t('settings.lang.en')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.lang.en.desc')}</p>
                </div>
                <div className={`w-4 h-4 rounded-full ${language === 'en' ? 'border-4 border-primary' : 'border border-border'}`}></div>
              </div>
              <div 
                onClick={() => { setLanguage('vi'); onClose(); }}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${language === 'vi' ? 'bg-secondary border-primary' : 'hover:bg-secondary'}`}
              >
                <div>
                  <p className="font-semibold text-foreground">{t('settings.lang.vi')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.lang.vi.desc')}</p>
                </div>
                <div className={`w-4 h-4 rounded-full ${language === 'vi' ? 'border-4 border-primary' : 'border border-border'}`}></div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" /> {t('partner.settings.general.theme')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-semibold">{t('partner.settings.general.light')}</p>
                  <p className="text-sm text-gray-500">{t('partner.settings.general.light_desc')}</p>
                </div>
                <div className="w-4 h-4 rounded-full border-4 border-primary"></div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer opacity-70">
                <div>
                  <p className="font-semibold">{t('partner.settings.general.dark')}</p>
                  <p className="text-sm text-gray-500">{t('partner.settings.general.dark_desc')}</p>
                </div>
                <div className="w-4 h-4 rounded-full border border-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
