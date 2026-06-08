import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useLanguage } from '../../shared/contexts/LanguageContext';
import { useState, useEffect } from 'react';

const screenTitleKeys: Record<string, string> = {
  '/partner': 'partner.nav.dashboard',
  '/partner/vouchers': 'partner.nav.vouchers',
  '/partner/create': 'partner.nav.create',
  '/partner/verify': 'partner.nav.verify',
  '/partner/reports': 'partner.nav.reports',
  '/partner/branches': 'partner.nav.branches',
  '/partner/store': 'partner.nav.store',
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
  
  const [partnerName, setPartnerName] = useState<string>('');

  useEffect(() => {
    const fetchPartnerName = async () => {
      try {
        const partnerId = localStorage.getItem('partnerId') || '1';
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/partners/${partnerId}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPartnerName(data.businessName || '');
        }
      } catch (err) {
        console.error("Failed to fetch partner profile", err);
      }
    };
    fetchPartnerName();
  }, []);

  const isDashboard = titleKey === 'partner.nav.dashboard';
  const title = isDashboard ? t(titleKey) : partnerName || t(titleKey);

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
