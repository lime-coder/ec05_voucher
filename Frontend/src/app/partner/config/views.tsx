import type { ReactElement } from 'react';
import {
  AddCircle as AddIcon,
  Assessment as ReportIcon,
  Dashboard as DashboardIcon,
  LocalOffer as VoucherIcon,
  Store as StoreIcon,
  VerifiedUser as VerifyIcon,
} from '@mui/icons-material';

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
  { id: 'dashboard', title: 'Tổng quan', icon: <DashboardIcon />, element: <DashboardView /> },
  { id: 'vouchers', title: 'Quản lý Voucher', icon: <VoucherIcon />, element: <VoucherManagement /> },
  { id: 'create', title: 'Tạo Voucher mới', icon: <AddIcon />, element: <CreateVoucher /> },
  { id: 'verify', title: 'Xác thực Voucher', icon: <VerifyIcon />, element: <VerifyVoucher /> },
  { id: 'reports', title: 'Báo cáo & Thống kê', icon: <ReportIcon />, element: <ReportsView /> },
  { id: 'branches', title: 'Quản lý Chi nhánh', icon: <StoreIcon />, element: <BranchManagement /> },
  { id: 'profile', title: 'Cài đặt tài khoản', element: <ProfileSettings />, hiddenFromSidebar: true },
];

export const navigationItems = viewConfigs.filter((view) => !view.hiddenFromSidebar);

export const viewById = viewConfigs.reduce(
  (views, view) => ({ ...views, [view.id]: view }),
  {} as Record<ViewId, ViewConfig>,
);
