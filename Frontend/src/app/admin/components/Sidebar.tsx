import { LayoutDashboard, Users, Handshake, BadgeCheck, ShoppingBag, Layout, ScrollText, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../shared/contexts/LanguageContext';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: '/admin', label: tText('Dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: '/admin/users', label: tText('User Management', 'Quản lý người dùng'), icon: Users },
    { id: '/admin/partners', label: tText('Partner Management', 'Quản lý đối tác'), icon: Handshake },
    { id: '/admin/vouchers', label: tText('Voucher Approval', 'Duyệt voucher'), icon: BadgeCheck },
    { id: '/admin/orders', label: tText('Order Management', 'Quản lý đơn hàng'), icon: ShoppingBag },
    { id: '/admin/content', label: tText('Content Management', 'Quản lý nội dung'), icon: Layout },
    { id: '/admin/logs', label: tText('System Logs', 'Nhật ký hệ thống'), icon: ScrollText },
  ];

  return (
    <div className="w-64 bg-primary text-primary-foreground h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-primary-foreground/10">
        <h1 className="text-xl font-bold mb-1">VoucherAdmin</h1>
        <p className="text-sm opacity-70">{tText('Administration System', 'Hệ thống quản trị')}</p>
      </div>

      <nav className="flex-1 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
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
        <div 
          onClick={() => navigate('/admin/profile')} 
          className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-primary-foreground/10 p-2 rounded-lg transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center font-semibold">
            AD
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium">Admin User</div>
            <div className="text-xs opacity-70">admin@voucher.vn</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-lg flex items-center justify-center gap-2 text-sm transition-all">
          <LogOut size={16} />
          {tText('Logout', 'Đăng xuất')}
        </button>
      </div>
    </div>
  );
}
