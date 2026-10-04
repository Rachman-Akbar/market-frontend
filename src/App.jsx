import { Suspense } from "react";
import { lazyWithRetry } from "@/core/utils/lazyWithRetry";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import BuyerLayout from "@/shared/layout/BuyerLayout";
import AuthLayout from "@/features/auth/AuthLayout";
import SellerLayout from "@/features/seller/SellerLayout";
const AdminLayout = lazyWithRetry(() => import("@/features/admin/AdminLayout"));
import ProfileLayout from "@/features/profile/ProfileLayout";
import ProtectedRoute from "@/features/auth/routes/ProtectedRoute";
import SellerOnboardingGuard from "@/features/auth/routes/SellerOnboardingGuard";
import GuestRoute from "@/features/auth/routes/GuestRoute";
import ErrorBoundary from "@/shared/components/feedback/ErrorBoundary";

const HomePage = lazyWithRetry(() => import("@/features/catalog/HomePage"));
const SearchPage = lazyWithRetry(() => import("@/features/catalog/product/pages/SearchPage"));
const ProductDetailPage = lazyWithRetry(() => import("@/features/catalog/product/pages/ProductDetailPage"));
const CategoryPage = lazyWithRetry(() => import("@/features/catalog/category/pages/CategoryPage"));
const PromotionPage = lazyWithRetry(() => import("@/features/catalog/promotion/pages/PromotionPage"));
const StoreDirectoryPage = lazyWithRetry(() => import("@/features/catalog/store/pages/StoreDirectoryPage"));
const StoreDetailPage = lazyWithRetry(() => import("@/features/catalog/store/pages/StoreDetailPage"));
const CartPage = lazyWithRetry(() => import("@/features/order/cart/pages/CartPage"));
const CheckoutPage = lazyWithRetry(() => import("@/features/order/ordering/pages/CheckoutPage"));
const OrderDetailPage = lazyWithRetry(() => import("@/features/order/ordering/pages/OrderDetailPage"));
const LoginPage = lazyWithRetry(() => import("@/features/auth/pages/LoginPage"));
const AdminLoginPage = lazyWithRetry(() => import("@/features/auth/pages/AdminLoginPage"));
const RegisterPage = lazyWithRetry(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazyWithRetry(() => import("@/features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazyWithRetry(() => import("@/features/auth/pages/ResetPasswordPage"));
const RoleSwitchPage = lazyWithRetry(() => import("@/features/auth/pages/RoleSwitchPage"));
const SellerOnboardingPage = lazyWithRetry(() => import("@/features/auth/pages/SellerOnboardingPage"));
const SellerDashboardPage = lazyWithRetry(() => import("@/features/seller/dashboard/pages/SellerDashboardPage"));
const SellerProductsPage = lazyWithRetry(() => import("@/features/seller/product/pages/SellerProductsPage"));
const SellerBannerPage = lazyWithRetry(() => import("@/features/seller/banner/pages/SellerBannerPage"));
const SellerVoucherPage = lazyWithRetry(() => import("@/features/seller/voucher/pages/SellerVoucherPage"));
const SellerPromotionPage = lazyWithRetry(() => import("@/features/seller/promotion/pages/SellerPromotionPage"));
const SellerStorePage = lazyWithRetry(() => import("@/features/seller/store/pages/SellerStorePage"));
const SellerStorePreviewPage = lazyWithRetry(() => import("@/features/seller/store/pages/SellerStorePreviewPage"));
const SellerOrdersPage = lazyWithRetry(() => import("@/features/seller/order/pages/SellerOrdersPage"));
const SchedulePage = lazyWithRetry(() => import("@/features/seller/planner/pages/SchedulePage"));
const AdminHomePage = lazyWithRetry(() => import("@/features/admin/dashboard/pages/AdminHomePage"));
const AdminProductsPage = lazyWithRetry(() => import("@/features/admin/product/pages/AdminProductsPage"));
const AdminCatalogGroupPage = lazyWithRetry(() => import("@/features/admin/catalogGroup/pages/AdminCatalogGroupPage"));
const AdminCategoryPage = lazyWithRetry(() => import("@/features/admin/category/pages/AdminCategoryPage"));
const AdminVoucherPage = lazyWithRetry(() => import("@/features/admin/voucher/pages/AdminVoucherPage"));
const AdminPromotionPage = lazyWithRetry(() => import("@/features/admin/promotion/pages/AdminPromotionPage"));
const AdminUsersPage = lazyWithRetry(() => import("@/features/admin/identity/pages/AdminUsersPage"));
const AdminRolesPage = lazyWithRetry(() => import("@/features/admin/identity/pages/AdminRolesPage"));
const AdminStoresPage = lazyWithRetry(() => import("@/features/admin/store/pages/AdminStoresPage"));
const AdminBannersPage = lazyWithRetry(() => import("@/features/admin/banner/pages/AdminBannersPage"));
const AdminGameContentPage = lazyWithRetry(() => import("@/features/admin/gameContent/pages/AdminGameContentPage"));
const AdminOrdersPage = lazyWithRetry(() => import("@/features/admin/order/pages/AdminOrdersPage"));
const AdminPpobPage = lazyWithRetry(() => import("@/features/admin/ppob/pages/AdminPpobPage"));
const AdminStoreContextPage = lazyWithRetry(() => import("@/features/admin/storeContext/pages/AdminStoreContextPage"));
const AdminFeeConfigPage = lazyWithRetry(() => import("@/features/admin/finance/pages/AdminFeeConfigPage"));
const AdminWithdrawalsPage = lazyWithRetry(() => import("@/features/admin/finance/pages/AdminWithdrawalsPage"));
const ProfilePage = lazyWithRetry(() => import("@/features/profile/identity/pages/ProfilePage"));
const AddressesPage = lazyWithRetry(() => import("@/features/profile/address/pages/AddressesPage"));
const GroupChatPage = lazyWithRetry(() => import("@/features/profile/chat/pages/GroupChatPage"));
const NotificationsPage = lazyWithRetry(() => import("@/features/profile/notifications/pages/NotificationsPage"));
const PaymentsPage = lazyWithRetry(() => import("@/features/profile/payments/pages/PaymentsPage"));
const VouchersPage = lazyWithRetry(() => import("@/features/profile/vouchers/pages/VouchersPage"));
const ModulePlaceholderPage = lazyWithRetry(() => import("@/shared/pages/ModulePlaceholderPage"));
const FinancePage = lazyWithRetry(() => import("@/features/advanced/pages/FinancePage"));
const StockPage = lazyWithRetry(() => import("@/features/advanced/pages/StockPage"));
const RawMaterialsPage = lazyWithRetry(() => import("@/features/advanced/pages/RawMaterialsPage"));
const CodePatternSettingsPage = lazyWithRetry(() => import("@/features/advanced/pages/CodePatternSettingsPage"));
const CustomersPage = lazyWithRetry(() => import("@/features/advanced/pages/CustomersPage"));
const ShowcasePage = lazyWithRetry(() => import("@/features/advanced/pages/ShowcasePage"));
const HelpPage = lazyWithRetry(() => import("@/features/advanced/pages/HelpPage"));
const MissionsPage = lazyWithRetry(() => import("@/features/advanced/pages/MissionsPage"));
const BuyerHelpPage = lazyWithRetry(() => import("@/features/profile/help/pages/BuyerHelpPage"));
const BuyerMissionsPage = lazyWithRetry(() => import("@/features/profile/missions/pages/BuyerMissionsPage"));
const PpobPage = lazyWithRetry(() => import("@/features/ppob/pages/PpobPage"));
const PpobReceiptPage = lazyWithRetry(() => import("@/features/ppob/pages/PpobReceiptPage"));
const PromotionPaymentsPage = lazyWithRetry(() => import("@/features/advanced/pages/PromotionPaymentsPage"));
const AnnouncementPage = lazyWithRetry(() => import("@/features/advanced/pages/AnnouncementPage"));
const ReviewsPage = lazyWithRetry(() => import("@/features/advanced/pages/ReviewsPage"));
const RealtimeChatPage = lazyWithRetry(() => import("@/features/advanced/pages/RealtimeChatPage"));


function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e0e3e7] border-t-[#10B981]" />
        <p className="text-sm text-[#5f5e5e]">Memuat...</p>
      </div>
    </div>
  );
}

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
      <Route path="/ppob" element={<PpobPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout/*" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/ppob/receipt/:ref" element={<PpobReceiptPage />} />
        <Route path="/riwayat" element={<Navigate to="/cart?tab=order" replace />} />
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
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
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
      <Route path="/profile/chat" element={<Navigate to="/chat" replace />} />
      <Route path="/profile/groups" element={<Navigate to="/chat/groups" replace />} />
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
          <Route path="/seller/bahan-baku" element={<RawMaterialsPage />} />
          <Route path="/seller/stock" element={<StockPage />} />
          <Route path="/seller/vouchers" element={<SellerVoucherPage />} />
          <Route path="/seller/promotions" element={<SellerPromotionPage />} />
          <Route path="/seller/orders" element={<SellerOrdersPage />} />
          <Route path="/seller/customers" element={<CustomersPage />} />
          <Route path="/seller/planner" element={<SchedulePage />} />
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
          <Route path="/seller/code-settings" element={<CodePatternSettingsPage />} />
        </Route>
      </Route>
    </Route>
  );
}

function renderAdminRoutes() {
  return (
    <Route element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login" />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/bahan-baku" element={<RawMaterialsPage />} />
        <Route path="/admin/stock" element={<StockPage />} />
        <Route path="/admin/vouchers" element={<AdminVoucherPage />} />
        <Route path="/admin/promotions" element={<AdminPromotionPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/ppob" element={<AdminPpobPage />} />
<Route path="/admin/customers" element={<CustomersPage />} />
          <Route path="/admin/cashflow" element={<FinancePage mode="cashflow" />} />
        <Route path="/admin/receivables-payables" element={<FinancePage mode="receivables" />} />
        <Route path="/admin/fee-configs" element={<AdminFeeConfigPage />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
        <Route path="/admin/showcases" element={<ShowcasePage />} />
        <Route path="/admin/promotion-payments" element={<PromotionPaymentsPage />} />
        <Route path="/admin/reviews" element={<ReviewsPage />} />
        <Route path="/admin/help" element={<HelpPage />} />
        <Route path="/admin/missions" element={<MissionsPage />} />
        <Route path="/admin/game-content" element={<AdminGameContentPage />} />
        <Route path="/admin/planner" element={<SchedulePage />} />
        <Route path="/admin/announcements" element={<AnnouncementPage />} />
        <Route path="/admin/chat" element={<RealtimeChatPage />} />
        <Route path="/admin/store-information" element={<ModulePlaceholderPage title="Informasi" group="Toko" icon="store" actionHref="/admin/stores" actionLabel="Kelola Data Toko" />} />
        <Route path="/admin/banners" element={<AdminBannersPage />} />
        <Route path="/admin/store-preview" element={<ModulePlaceholderPage title="Preview Toko" group="Toko" icon="preview" actionHref="/stores" actionLabel="Buka Marketplace" />} />
        <Route path="/admin/code-settings" element={<CodePatternSettingsPage />} />
        <Route path="/admin/categories" element={<AdminCategoryPage />} />
        <Route path="/admin/catalog-groups" element={<AdminCatalogGroupPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/stores" element={<AdminStoresPage />} />
        <Route path="/admin/store-context" element={<AdminStoreContextPage />} />
        <Route path="/admin/roles" element={<AdminRolesPage />} />
      </Route>
    </Route>
  );
}

export default function App() {
  return (
    <AppLayout>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </AppLayout>
  );
}
