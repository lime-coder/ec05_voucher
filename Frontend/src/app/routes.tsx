import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "./auth/ProtectedRoute";

// Auth
import { LoginPage } from "./customer/pages/LoginPage";

// Customer Route Components
import { CustomerLayout } from "./customer/layout/CustomerLayout";
import { HomePage } from "./customer/pages/HomePage";
import { RegisterCustomerPage } from "./customer/pages/RegisterCustomerPage";
import { RegisterPartnerPage } from "./customer/pages/RegisterPartnerPage";
import { SearchResultsPage } from "./customer/pages/SearchResultsPage";
import { VoucherDetailPage } from "./customer/pages/VoucherDetailPage";
import { WriteReviewPage } from "./customer/pages/WriteReviewPage";
import { ShoppingCartPage } from "./customer/pages/ShoppingCartPage";
import { ReviewOrderPage } from "./customer/pages/ReviewOrderPage";
import { PaymentMethodPage } from "./customer/pages/PaymentMethodPage";
import { ThankYouPage } from "./customer/pages/ThankYouPage";
import { OrderHistoryPage } from "./customer/pages/OrderHistoryPage";
import { OrderDetailPage } from "./customer/pages/OrderDetailPage";
import { CustomerProfilePage } from "./customer/pages/CustomerProfilePage";
import { PartnerProfilePage } from "./customer/pages/PartnerProfilePage";
import { ExperiencePage } from "./customer/pages/ExperiencePage";
import { BrandStorePage } from "./customer/pages/BrandStorePage";

// Admin Route Components
import { AdminLayout } from "./admin/layout/AdminLayout";
import { Dashboard as AdminDashboard } from "./admin/components/screens/Dashboard";
import { UserManagement } from "./admin/components/screens/UserManagement";
import { PartnerManagement } from "./admin/components/screens/PartnerManagement";
import { VoucherApproval } from "./admin/components/screens/VoucherApproval";
import { OrderManagement as AdminOrderManagement } from "./admin/components/screens/OrderManagement";
import { ContentManagement } from "./admin/components/screens/ContentManagement/index";
import { SystemLogs } from "./admin/components/screens/SystemLogs";
import { BannerEdit } from "./admin/components/screens/BannerEdit";
import { AdminProfile } from "./admin/components/screens/AdminProfile";
import { BranchStats } from "./admin/components/screens/BranchStats";

// Shared Route Components
import { NotificationsPage } from "./shared/pages/NotificationsPage";
import { ErrorPage } from "./shared/pages/ErrorPage";

// Partner Route Components
import { PartnerLayout } from "./partner/layout/PartnerLayout";
import DashboardView from "./partner/features/DashboardView";
import VoucherManagement from "./partner/features/VoucherManagement/index";
import CreateVoucher from "./partner/features/CreateVoucher";
import VerifyVoucher from "./partner/features/VerifyVoucher";
import ReportsView from "./partner/features/ReportsView";
import BranchManagement from "./partner/features/BranchManagement";
import ProfileSettings from "./partner/features/ProfileSettings";
import StoreStats from "./partner/features/StoreStats";

export const router = createBrowserRouter([

  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "register/customer",
    element: <RegisterCustomerPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "register/partner",
    element: <RegisterPartnerPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "partners", element: <PartnerManagement /> },
      { path: "vouchers", element: <VoucherApproval /> },
      { path: "orders", element: <AdminOrderManagement /> },
      { path: "content", element: <ContentManagement /> },
      { path: "content/banner/:id", element: <BannerEdit /> },
      { path: "logs", element: <SystemLogs /> },
      { path: "profile", element: <AdminProfile /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "branch-stats", element: <BranchStats /> },
    ],
  },
  {
    path: "/partner",
    element: (
      <ProtectedRoute allowedRole="partner">
        <PartnerLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardView /> },
      { path: "vouchers", element: <VoucherManagement /> },
      { path: "create", element: <CreateVoucher /> },
      { path: "verify", element: <VerifyVoucher /> },
      { path: "reports", element: <ReportsView /> },
      { path: "branches", element: <BranchManagement /> },
      { path: "profile", element: <ProfileSettings /> },
      { path: "store", element: <StoreStats /> },
      { path: "notifications", element: <NotificationsPage /> },
    ],
  },
  {
    path: "/",
    element: <CustomerLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "experience", element: <ExperiencePage /> },
      { path: "search", element: <SearchResultsPage /> },
      { path: "voucher/:id", element: <VoucherDetailPage /> },
      { path: "review/:id", element: <WriteReviewPage /> },
      { path: "cart", element: <ShoppingCartPage /> },
      { path: "checkout/review", element: <ReviewOrderPage /> },
      { path: "checkout/payment", element: <PaymentMethodPage /> },
      { path: "checkout/success", element: <ThankYouPage /> },
      { path: "orders", element: <OrderHistoryPage /> },
      { path: "orders/:orderId", element: <OrderDetailPage /> },
      { path: "profile/customer", element: <CustomerProfilePage /> },
      { path: "profile/partner", element: <PartnerProfilePage /> },
      { path: "brand/:id", element: <BrandStorePage /> },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
