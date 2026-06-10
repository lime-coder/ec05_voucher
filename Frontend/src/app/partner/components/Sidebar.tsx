import { LayoutDashboard, Tag, PlusCircle, CheckCircle, BarChart3, Store, Settings, LogOut, ShoppingBag, Users, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../shared/contexts/LanguageContext';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const partnerId = localStorage.getItem('partnerId') || '1';
  
  const menuItems = [
    { id: '/partner', label: t('partner.nav.dashboard'), icon: LayoutDashboard },
    { id: '/partner/vouchers', label: t('partner.nav.vouchers'), icon: Tag },
    { id: '/partner/create', label: t('partner.nav.create'), icon: PlusCircle },
    { id: '/partner/verify', label: t('partner.nav.verify'), icon: CheckCircle },
    { id: '/partner/purchases', label: t('partner.nav.purchases') || 'Giao dịch KH', icon: ShoppingCart },
    { id: '/partner/reports', label: t('partner.nav.reports'), icon: BarChart3 },
    { id: '/partner/branches', label: t('partner.nav.branches'), icon: Store },
    { id: '/partner/store', label: t('partner.nav.store') || 'Cửa hàng', icon: ShoppingBag },
    { id: '/partner/staff', label: t('partner.nav.staff') || 'Nhân viên', icon: Users },
    { id: '/partner/profile', label: t('partner.nav.profile'), icon: Settings },
  ];

  return (
    <div className="w-64 bg-primary text-primary-foreground h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-primary-foreground/10">
        <h1 className="text-xl font-bold mb-1">VoucherHub</h1>
        <p className="text-sm opacity-70">{t('partner.portal')}</p>
      </div>

      <nav className="flex-1 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if ((item as any).external) {
                  window.open(item.id, '_blank');
                } else {
                  navigate(item.id);
                }
              }}
              className={`w-full px-5 py-3 flex items-center gap-3 text-sm transition-all border-l-4 ${
                isActive
                  ? 'bg-primary-foreground/15 border-primary-foreground font-semibold'
                  : 'border-transparent hover:bg-primary-foreground/10'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-5 border-t border-primary-foreground/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center font-semibold">
            {user?.HoTenNguoiDung ? user.HoTenNguoiDung.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'PA'}
          </div>
          <div className="flex-1 text-sm overflow-hidden">
            <div className="font-medium truncate">{user?.HoTenNguoiDung || 'Partner User'}</div>
            <div className="text-xs opacity-70 truncate">{user?.Email || 'partner@voucher.vn'}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg flex items-center justify-center gap-2 text-sm transition-all">
          <LogOut size={16} />
          {t('partner.logout')}
        </button>
      </div>
    </div>
  );
}
