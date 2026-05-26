import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import { AdminLayout } from './layout/AdminLayout';
import { Dashboard } from './components/screens/Dashboard';
import { UserManagement } from './components/screens/UserManagement';
import { PartnerManagement } from './components/screens/PartnerManagement';
import { VoucherApproval } from './components/screens/VoucherApproval';
import { OrderManagement } from './components/screens/OrderManagement';
import { ContentManagement } from './components/screens/ContentManagement';
import { SystemLogs } from './components/screens/SystemLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="partners" element={<PartnerManagement />} />
          <Route path="vouchers" element={<VoucherApproval />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="logs" element={<SystemLogs />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
