import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router';
import { PartnerLayout } from './layout/PartnerLayout';

// Placeholder feature components, will be migrated to Tailwind later
import DashboardView from './features/DashboardView';
import VoucherManagement from './features/VoucherManagement';
import CreateVoucher from './features/CreateVoucher';
import VerifyVoucher from './features/VerifyVoucher';
import ReportsView from './features/ReportsView';
import BranchManagement from './features/BranchManagement';
import ProfileSettings from './features/ProfileSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PartnerLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="vouchers" element={<VoucherManagement />} />
          <Route path="create" element={<CreateVoucher />} />
          <Route path="verify" element={<VerifyVoucher />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="branches" element={<BranchManagement />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
