import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useLanguage } from '../../shared/contexts/LanguageContext';

const screenTitleKeys: Record<string, string> = {
  '/partner': 'partner.nav.dashboard',
  '/partner/vouchers': 'partner.nav.vouchers',
  '/partner/create': 'partner.nav.create',
  '/partner/verify': 'partner.nav.verify',
  '/partner/reports': 'partner.nav.reports',
  '/partner/branches': 'partner.nav.branches',
  '/partner/profile': 'partner.nav.profile',
  '/': 'partner.nav.dashboard',
  '/vouchers': 'partner.nav.vouchers',
  '/create': 'partner.nav.create',
  '/verify': 'partner.nav.verify',
  '/reports': 'partner.nav.reports',
  '/branches': 'partner.nav.branches',
  '/profile': 'partner.nav.profile',
};

export function PartnerLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const titleKey = screenTitleKeys[location.pathname] || 'partner.nav.dashboard';
  const title = t(titleKey);

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
