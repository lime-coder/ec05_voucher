import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShoppingBag, Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

interface Notification {
  id: string;
  type: 'success' | 'order' | 'info' | 'alert';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

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
        }
      })
      .catch(err => console.error('Fetch page notifications error:', err));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(
    (n) => activeFilter === 'all' || !n.isRead
  );

  const markAllAsRead = () => {
    const ids = notifications.map(n => n.id);
    localStorage.setItem('admin_read_notifs', JSON.stringify(ids));
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem('admin_read_notifs') || '[]');
    if (!readIds.includes(id)) {
      const nextRead = [...readIds, id];
      localStorage.setItem('admin_read_notifs', JSON.stringify(nextRead));
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }

    if (id.startsWith('partner-')) {
      navigate('/admin/partners');
    } else if (id.startsWith('voucher-')) {
      navigate('/admin/vouchers');
    } else if (id.startsWith('order-')) {
      navigate('/admin/orders');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            {t('notification.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('notification.desc')}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('notification.all')}
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'unread' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t('notification.unread')}
            </button>
          </div>
          
          <button 
            onClick={markAllAsRead}
            className="text-sm text-primary font-semibold hover:underline"
          >
            {t('notification.mark_all_read')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <p>{t('notification.empty')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => markAsRead(notif.id)}
                className={`p-6 flex gap-4 transition-colors cursor-pointer hover:bg-gray-50 ${!notif.isRead ? 'bg-primary/5' : ''}`}
              >
                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-semibold ${!notif.isRead ? 'text-foreground' : 'text-gray-700'}`}>
                      {language === 'vi' ? notif.titleVi : notif.titleEn}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {tText('Recent', 'Gần đây')}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                    {language === 'vi' ? notif.messageVi : notif.messageEn}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
