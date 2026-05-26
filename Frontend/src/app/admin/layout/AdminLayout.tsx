import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const screenTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Quản lý người dùng',
  '/partners': 'Quản lý đối tác',
  '/vouchers': 'Duyệt voucher',
  '/orders': 'Quản lý đơn hàng',
  '/content': 'Quản lý nội dung',
  '/logs': 'Nhật ký hệ thống',
};

export function AdminLayout() {
  const location = useLocation();
  const title = screenTitles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <ScrollRestoration />
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
