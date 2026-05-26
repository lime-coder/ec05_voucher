import type { ReactElement } from 'react';
import {
  LayoutDashboard,
  Tag,
  PlusCircle,
  ShieldCheck,
  BarChart3,
  Store,
} from 'lucide-react';

import BranchManagement from '../features/BranchManagement';
import CreateVoucher from '../features/CreateVoucher';
import DashboardView from '../features/DashboardView';
import ProfileSettings from '../features/ProfileSettings';
import ReportsView from '../features/ReportsView';
import VerifyVoucher from '../features/VerifyVoucher';
import VoucherManagement from '../features/VoucherManagement';
import type { ViewId } from '../types/domain';

interface ViewConfig {
  id: ViewId;
  title: string;
  icon?: ReactElement;
  element: ReactElement;
  hiddenFromSidebar?: boolean;
}

export const viewConfigs: ViewConfig[] = [
  { id: 'dashboard', title: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" />, element: <DashboardView /> },
  { id: 'vouchers', title: 'Quản lý Voucher', icon: <Tag className="w-5 h-5" />, element: <VoucherManagement /> },
  { id: 'create', title: 'Tạo Voucher mới', icon: <PlusCircle className="w-5 h-5" />, element: <CreateVoucher /> },
  { id: 'verify', title: 'Xác thực Voucher', icon: <ShieldCheck className="w-5 h-5" />, element: <VerifyVoucher /> },
  { id: 'reports', title: 'Báo cáo & Thống kê', icon: <BarChart3 className="w-5 h-5" />, element: <ReportsView /> },
  { id: 'branches', title: 'Quản lý Chi nhánh', icon: <Store className="w-5 h-5" />, element: <BranchManagement /> },
  { id: 'profile', title: 'Cài đặt tài khoản', element: <ProfileSettings />, hiddenFromSidebar: true },
];

export const navigationItems = viewConfigs.filter((view) => !view.hiddenFromSidebar);

export const viewById = viewConfigs.reduce(
  (views, view) => ({ ...views, [view.id]: view }),
  {} as Record<ViewId, ViewConfig>,
);
