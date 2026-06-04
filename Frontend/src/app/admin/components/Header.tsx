import { useState, useEffect } from 'react';
import { Bell, Search, UserCircle, LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { AdminSettingsModal } from './AdminSettingsModal';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t, language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = () => {
    fetch('/api/admin/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const readIds = JSON.parse(localStorage.getItem('admin_read_notifs') || '[]');
          const mapped = data.map((n: any) => ({
            ...n,
            isRead: readIds.includes(n.id)
          }));
          setNotifications(mapped);
          setUnreadCount(mapped.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(err => console.error('Fetch header notifications error:', err));
  };

  useEffect(() => {
    fetchNotifications();
  }, [isNotifOpen]);

  const handleMarkAsRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem('admin_read_notifs') || '[]');
    if (!readIds.includes(id)) {
      const nextRead = [...readIds, id];
      localStorage.setItem('admin_read_notifs', JSON.stringify(nextRead));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // Navigate to respective page and close popover
    setIsNotifOpen(false);
    if (id.startsWith('partner-')) {
      navigate('/admin/partners');
    } else if (id.startsWith('voucher-')) {
      navigate('/admin/vouchers');
    } else if (id.startsWith('order-')) {
      navigate('/admin/orders');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">{t('admin.notif.title')}</div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-start gap-2 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${!notif.isRead ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                        {language === 'vi' ? notif.titleVi : notif.titleEn}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                        {language === 'vi' ? notif.messageVi : notif.messageEn}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5"></span>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-8 text-center text-xs text-gray-400">
                    {tText('No new notifications', 'Không có thông báo mới')}
                  </div>
                )}
              </div>
              <div 
                onClick={() => { setIsNotifOpen(false); navigate('/admin/notifications'); }}
                className="p-3 text-center text-sm text-primary font-medium hover:bg-gray-50 cursor-pointer border-t"
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
                <button 
                  onClick={() => { navigate('/admin/profile'); setIsProfileOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User size={16} /> {t('header.partner.my_profile')}
                </button>
                <button 
                  onClick={() => { setIsSettingsOpen(true); setIsProfileOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings size={16} /> {t('header.partner.settings')}
                </button>
              </div>
              <div className="border-t border-gray-100 py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> {t('header.partner.logout')}
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
