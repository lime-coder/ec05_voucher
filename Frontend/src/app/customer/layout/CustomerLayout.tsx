import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useAuth } from '../../auth/AuthContext';

export function CustomerLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const hideFooterRoutes = ['/login', '/register/customer', '/register/partner', '/review/:id'];
  const showFooter = !hideFooterRoutes.some(route => location.pathname.startsWith(route.replace('/:id', '')));

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <ScrollRestoration />
      <Navbar isLoggedIn={user?.role === 'customer'} />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
