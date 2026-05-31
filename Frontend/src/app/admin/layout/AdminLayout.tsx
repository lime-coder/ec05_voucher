import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

const getScreenInfo = (pathname: string) => {
  if (pathname === '/admin' || pathname === '/admin/') {
    return { title: 'Dashboard', subtitle: 'Tổng quan hệ thống và thống kê kinh doanh' };
  }
  if (pathname.includes('/admin/users')) {
    return { title: 'Quản lý người dùng', subtitle: 'Quản lý tài khoản và phân quyền hệ thống' };
  }
  if (pathname.includes('/admin/partners')) {
    return { title: 'Quản lý đối tác', subtitle: 'Quản lý thông tin và trạng thái đối tác' };
  }
  if (pathname.includes('/admin/vouchers')) {
    return { title: 'Duyệt voucher', subtitle: 'Kiểm duyệt và quản lý danh sách voucher' };
  }
  if (pathname.includes('/admin/orders')) {
    return { title: 'Quản lý đơn hàng', subtitle: 'Theo dõi và xử lý các giao dịch mua hàng' };
  }
  if (pathname.includes('/admin/content')) {
    return { title: 'Quản lý nội dung', subtitle: 'Cấu hình banner và nội dung hiển thị' };
  }
  if (pathname.includes('/admin/logs')) {
    return { title: 'Nhật ký hệ thống', subtitle: 'Theo dõi lịch sử hoạt động của hệ thống' };
  }
  if (pathname.includes('/admin/notifications')) {
    return { title: 'Thông báo', subtitle: 'Quản lý các thông báo từ hệ thống' };
  }
  return { title: 'Dashboard', subtitle: 'Tổng quan hệ thống' };
};

export function AdminLayout() {
  const location = useLocation();
  const { title, subtitle } = getScreenInfo(location.pathname);

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <ScrollRestoration />
      <Sidebar />
      <div className="ml-64">
        <Header title={title} subtitle={subtitle} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
