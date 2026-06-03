import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useLanguage } from '../../shared/contexts/LanguageContext';

export function AdminLayout() {
  const location = useLocation();
  const { language } = useLanguage();
  const tText = (en: string, vi: string) => (language === 'vi' ? vi : en);

  const getScreenInfo = (pathname: string) => {
    if (pathname === '/admin' || pathname === '/admin/') {
      return { 
        title: 'Dashboard', 
        subtitle: tText('System overview and business statistics', 'Tổng quan hệ thống và thống kê kinh doanh') 
      };
    }
    if (pathname.includes('/admin/users')) {
      return { 
        title: tText('User Management', 'Quản lý người dùng'), 
        subtitle: tText('Manage system accounts and permissions', 'Quản lý tài khoản và phân quyền hệ thống') 
      };
    }
    if (pathname.includes('/admin/partners')) {
      return { 
        title: tText('Partner Approval', 'Duyệt đối tác'), 
        subtitle: tText('Review and manage partner registration approval', 'Kiểm duyệt và quản lý đối tác đăng ký') 
      };
    }
    if (pathname.includes('/admin/vouchers')) {
      return { 
        title: tText('Voucher Approval', 'Duyệt voucher'), 
        subtitle: tText('Review and approve voucher listings', 'Kiểm duyệt và quản lý danh sách voucher') 
      };
    }
    if (pathname.includes('/admin/orders')) {
      return { 
        title: tText('Order Management', 'Quản lý đơn hàng'), 
        subtitle: tText('Track and process purchase transactions', 'Theo dõi và xử lý các giao dịch mua hàng') 
      };
    }
    if (pathname.includes('/admin/content')) {
      return { 
        title: tText('Content Management', 'Quản lý nội dung'), 
        subtitle: tText('Configure banners and display content', 'Cấu hình banner và nội dung hiển thị') 
      };
    }
    if (pathname.includes('/admin/logs')) {
      return { 
        title: tText('System Logs', 'Nhật ký hệ thống'), 
        subtitle: tText('Monitor system activity history', 'Theo dõi lịch sử hoạt động của hệ thống') 
      };
    }
    if (pathname.includes('/admin/notifications')) {
      return { 
        title: tText('Notifications', 'Thông báo'), 
        subtitle: tText('Manage system notifications', 'Quản lý các thông báo từ hệ thống') 
      };
    }
    if (pathname.includes('/admin/profile')) {
      return { 
        title: tText('Admin Profile', 'Hồ sơ Admin'), 
        subtitle: tText('Manage your personal account details and security settings.', 'Quản lý thông tin tài khoản cá nhân và cài đặt bảo mật.') 
      };
    }
    return { 
      title: 'Dashboard', 
      subtitle: tText('System overview', 'Tổng quan hệ thống') 
    };
  };

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
