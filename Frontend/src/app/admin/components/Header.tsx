import { useState } from 'react';
import { Bell, Search, UserCircle, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { AdminSettingsModal } from './AdminSettingsModal';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
      <h2 className="text-2xl font-bold text-primary">{title}</h2>

      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">{t('admin.notif.title')}</div>
              <div className="max-h-80 overflow-y-auto">
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium">{t('admin.notif.new_partner')}</p>
                  <p className="text-xs text-gray-500">{t('admin.notif.new_partner_desc')}</p>
                </div>
                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm font-medium">{t('admin.notif.voucher_approval')}</p>
                  <p className="text-xs text-gray-500">{t('admin.notif.voucher_approval_desc')}</p>
                </div>
              </div>
              <div 
                onClick={() => { setIsNotifOpen(false); navigate('/admin/notifications'); }}
                className="p-3 text-center text-sm text-primary font-medium hover:bg-gray-50 cursor-pointer"
              >
                {t('admin.notif.view_all')}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center font-semibold text-primary">
              AD
            </div>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@voucher.vn</p>
              </div>
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <User size={16} /> My Profile
                </button>
                <button 
                  onClick={() => { setIsSettingsOpen(true); setIsProfileOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings size={16} /> Settings
                </button>
              </div>
              <div className="border-t border-gray-100 py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </header>
  );
}
