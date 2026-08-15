import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import BuyerLayout from "@/shared/layout/BuyerLayout";
import AuthLayout from "@/features/auth/AuthLayout";
import SellerLayout from "@/features/seller/SellerLayout";
import AdminLayout from "@/features/admin/AdminLayout";
import ProfileLayout from "@/features/profile/ProfileLayout";
import ProtectedRoute from "@/features/auth/routes/ProtectedRoute";
import SellerOnboardingGuard from "@/features/auth/routes/SellerOnboardingGuard";
import GuestRoute from "@/features/auth/routes/GuestRoute";

const HomePage = lazy(() => import("@/features/catalog/HomePage"));
const SearchPage = lazy(() => import("@/features/catalog/product/pages/SearchPage"));
const ProductDetailPage = lazy(() => import("@/features/catalog/product/pages/ProductDetailPage"));
const CategoryPage = lazy(() => import("@/features/catalog/category/pages/CategoryPage"));
const PromotionPage = lazy(() => import("@/features/catalog/promotion/pages/PromotionPage"));
const StoreDirectoryPage = lazy(() => import("@/features/catalog/store/pages/StoreDirectoryPage"));
const StoreDetailPage = lazy(() => import("@/features/catalog/store/pages/StoreDetailPage"));
const CartPage = lazy(() => import("@/features/order/cart/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/features/order/ordering/pages/CheckoutPage"));
const OrderDetailPage = lazy(() => import("@/features/order/ordering/pages/OrderDetailPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const AdminLoginPage = lazy(() => import("@/features/auth/pages/AdminLoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const RoleSwitchPage = lazy(() => import("@/features/auth/pages/RoleSwitchPage"));
const SellerOnboardingPage = lazy(() => import("@/features/auth/pages/SellerOnboardingPage"));
const SellerDashboardPage = lazy(() => import("@/features/seller/dashboard/pages/SellerDashboardPage"));
const SellerProductsPage = lazy(() => import("@/features/seller/product/pages/SellerProductsPage"));
const SellerBannerPage = lazy(() => import("@/features/seller/banner/pages/SellerBannerPage"));
const SellerVoucherPage = lazy(() => import("@/features/seller/voucher/pages/SellerVoucherPage"));
const SellerPromotionPage = lazy(() => import("@/features/seller/promotion/pages/SellerPromotionPage"));
const SellerStorePage = lazy(() => import("@/features/seller/store/pages/SellerStorePage"));
const SellerStorePreviewPage = lazy(() => import("@/features/seller/store/pages/SellerStorePreviewPage"));
const SellerOrdersPage = lazy(() => import("@/features/seller/order/pages/SellerOrdersPage"));
const AdminDashboardPage = lazy(() => import("@/features/admin/dashboard/pages/AdminDashboardPage"));
const AdminProductsPage = lazy(() => import("@/features/admin/product/pages/AdminProductsPage"));
const AdminCatalogGroupPage = lazy(() => import("@/features/admin/catalogGroup/pages/AdminCatalogGroupPage"));
const AdminCategoryPage = lazy(() => import("@/features/admin/category/pages/AdminCategoryPage"));
const AdminVoucherPage = lazy(() => import("@/features/admin/voucher/pages/AdminVoucherPage"));
const AdminPromotionPage = lazy(() => import("@/features/admin/promotion/pages/AdminPromotionPage"));
const AdminUsersPage = lazy(() => import("@/features/admin/identity/pages/AdminUsersPage"));
const AdminRolesPage = lazy(() => import("@/features/admin/identity/pages/AdminRolesPage"));
const AdminStoresPage = lazy(() => import("@/features/admin/store/pages/AdminStoresPage"));
const AdminBannersPage = lazy(() => import("@/features/admin/banner/pages/AdminBannersPage"));
const AdminOrdersPage = lazy(() => import("@/features/admin/order/pages/AdminOrdersPage"));
const ProfilePage = lazy(() => import("@/features/profile/identity/pages/ProfilePage"));
const AddressesPage = lazy(() => import("@/features/profile/address/pages/AddressesPage"));
const GroupChatPage = lazy(() => import("@/features/profile/chat/pages/GroupChatPage"));
const NotificationsPage = lazy(() => import("@/features/profile/notifications/pages/NotificationsPage"));
const PaymentsPage = lazy(() => import("@/features/profile/payments/pages/PaymentsPage"));
const VouchersPage = lazy(() => import("@/features/profile/vouchers/pages/VouchersPage"));
const ModulePlaceholderPage = lazy(() => import("@/shared/pages/ModulePlaceholderPage"));
const FinancePage = lazy(() => import("@/features/advanced/pages/FinancePage"));
const StockPage = lazy(() => import("@/features/advanced/pages/StockPage"));
const CustomersPage = lazy(() => import("@/features/advanced/pages/CustomersPage"));
const ShowcasePage = lazy(() => import("@/features/advanced/pages/ShowcasePage"));
const HelpPage = lazy(() => import("@/features/advanced/pages/HelpPage"));
const MissionsPage = lazy(() => import("@/features/advanced/pages/MissionsPage"));
const BuyerHelpPage = lazy(() => import("@/features/profile/help/pages/BuyerHelpPage"));
const BuyerMissionsPage = lazy(() => import("@/features/profile/missions/pages/BuyerMissionsPage"));
const PromotionPaymentsPage = lazy(() => import("@/features/advanced/pages/PromotionPaymentsPage"));
const AnnouncementPage = lazy(() => import("@/features/advanced/pages/AnnouncementPage"));
const OrderOperationsPage = lazy(() => import("@/features/advanced/pages/OrderOperationsPage"));
const ReviewsPage = lazy(() => import("@/features/advanced/pages/ReviewsPage"));
const RealtimeChatPage = lazy(() => import("@/features/advanced/pages/RealtimeChatPage"));


function LoadingScreen() { return null; }

function renderBuyerRoutes() {
  return (
    <Route element={<BuyerLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/category/*" element={<CategoryPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/promotions" element={<PromotionPage />} />
      <Route path="/stores" element={<StoreDirectoryPage />} />
      <Route path="/stores/id/:id" element={<StoreDetailPage />} />
      <Route path="/stores/:slug" element={<StoreDetailPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/*" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
      </Route>
    </Route>
  );
}

function renderAuthenticationRoutes() {
  return (
    <>
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage portal="buyer" />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/chat/login" element={<LoginPage portal="chat" />} />
      </Route>
    </>
  );
}

function renderAccountRoutes() {
  return (
    <Route element={<ProtectedRoute />}>
      <Route path="/auth/role-switch" element={<RoleSwitchPage />} />
      <Route path="/auth/seller/onboarding" element={<SellerOnboardingPage />} />
      <Route element={<ProfileLayout />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders" element={<Navigate to="/cart?tab=order" replace />} />
        <Route path="/profile/addresses" element={<AddressesPage />} />
        <Route path="/profile/wishlist" element={<Navigate to="/cart?tab=wishlist" replace />} />
        <Route path="/profile/notifications" element={<NotificationsPage />} />
        <Route path="/profile/payments" element={<PaymentsPage />} />
        <Route path="/profile/vouchers" element={<VouchersPage />} />
        <Route path="/profile/help" element={<BuyerHelpPage />} />
        <Route path="/profile/missions" element={<BuyerMissionsPage />} />
        <Route path="/chat" element={<RealtimeChatPage />} />
        <Route path="/chat/groups" element={<GroupChatPage />} />
      </Route>
      <Route path="/profile/chat" element={<Navigate to="/chat/login?redirect=/chat" replace />} />
      <Route path="/profile/groups" element={<Navigate to="/chat/login?redirect=/chat/groups" replace />} />
    </Route>
  );
}

function renderSellerRoutes() {
  return (
    <Route element={<ProtectedRoute roles={["seller"]} />}>
      <Route element={<SellerOnboardingGuard />}>
        <Route element={<SellerLayout />}>
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/stock" element={<StockPage />} />
          <Route path="/seller/vouchers" element={<SellerVoucherPage />} />
          <Route path="/seller/promotions" element={<SellerPromotionPage />} />
          <Route path="/seller/orders" element={<SellerOrdersPage />} />
          <Route path="/seller/customers" element={<CustomersPage />} />
          <Route path="/seller/order-operations" element={<OrderOperationsPage />} />
          <Route path="/seller/cashflow" element={<FinancePage mode="cashflow" />} />
          <Route path="/seller/receivables-payables" element={<FinancePage mode="receivables" />} />
          <Route path="/seller/showcases" element={<ShowcasePage />} />
          <Route path="/seller/promotion-payments" element={<PromotionPaymentsPage />} />
          <Route path="/seller/reviews" element={<ReviewsPage />} />
          <Route path="/seller/help" element={<HelpPage />} />
          <Route path="/seller/chat" element={<RealtimeChatPage />} />
          <Route path="/seller/store" element={<SellerStorePage />} />
          <Route path="/seller/banners" element={<SellerBannerPage />} />
          <Route path="/seller/store-preview" element={<SellerStorePreviewPage />} />
          <Route path="/seller/categories" element={<ModulePlaceholderPage title="Category" group="Aplikasi" icon="account_tree" />} />
          <Route path="/seller/catalog-groups" element={<ModulePlaceholderPage title="Catalog Group" group="Aplikasi" icon="category" />} />
          <Route path="/seller/users" element={<ModulePlaceholderPage title="User" group="Manajemen" icon="group" />} />
          <Route path="/seller/store-management" element={<ModulePlaceholderPage title="Toko" group="Manajemen" icon="storefront" actionHref="/seller/store" actionLabel="Buka Informasi Toko" />} />
        </Route>
      </Route>
    </Route>
  );
}

function renderAdminRoutes() {
  return (
    <Route element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login" />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/stock" element={<StockPage />} />
        <Route path="/admin/vouchers" element={<AdminVoucherPage />} />
        <Route path="/admin/promotions" element={<AdminPromotionPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/order-operations" element={<OrderOperationsPage />} />
        <Route path="/admin/cashflow" element={<FinancePage mode="cashflow" />} />
        <Route path="/admin/receivables-payables" element={<FinancePage mode="receivables" />} />
        <Route path="/admin/showcases" element={<ShowcasePage />} />
        <Route path="/admin/promotion-payments" element={<PromotionPaymentsPage />} />
        <Route path="/admin/reviews" element={<ReviewsPage />} />
        <Route path="/admin/help" element={<HelpPage />} />
        <Route path="/admin/missions" element={<MissionsPage />} />
        <Route path="/admin/announcements" element={<AnnouncementPage />} />
        <Route path="/admin/chat" element={<RealtimeChatPage />} />
        <Route path="/admin/store-information" element={<ModulePlaceholderPage title="Informasi" group="Toko" icon="store" actionHref="/admin/stores" actionLabel="Kelola Data Toko" />} />
        <Route path="/admin/banners" element={<AdminBannersPage />} />
        <Route path="/admin/store-preview" element={<ModulePlaceholderPage title="Preview Toko" group="Toko" icon="preview" actionHref="/stores" actionLabel="Buka Marketplace" />} />
        <Route path="/admin/categories" element={<AdminCategoryPage />} />
        <Route path="/admin/catalog-groups" element={<AdminCatalogGroupPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/stores" element={<AdminStoresPage />} />
        <Route path="/admin/roles" element={<AdminRolesPage />} />
      </Route>
    </Route>
  );
}

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {renderBuyerRoutes()}
          {renderAuthenticationRoutes()}
          {renderAccountRoutes()}
          {renderSellerRoutes()}
          {renderAdminRoutes()}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
