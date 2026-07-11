import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/shared/layout/AppLayout";
import BuyerLayout from "@/shared/layout/BuyerLayout";
import AuthLayout from "@/features/auth/AuthLayout";
import SellerLayout from "@/features/seller/SellerLayout";
import AdminLayout from "@/features/admin/AdminLayout";
import ProfileLayout from "@/features/profile/ProfileLayout";
import ProtectedRoute from "@/features/auth/routes/ProtectedRoute";
import GuestRoute from "@/features/auth/routes/GuestRoute";

const HomePage = lazy(() => import("@/features/catalog/HomePage"));
const SearchPage = lazy(() => import("@/features/catalog/product/pages/SearchPage"));
const ProductDetailPage = lazy(() => import("@/features/catalog/product/pages/ProductDetailPage"));
const CategoryPage = lazy(() => import("@/features/catalog/category/pages/CategoryPage"));
const PromotionPage = lazy(() => import("@/features/catalog/promotion/pages/PromotionPage"));
const CartPage = lazy(() => import("@/features/order/cart/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/features/order/ordering/pages/CheckoutPage"));
const OrderDetailPage = lazy(() => import("@/features/order/ordering/pages/OrderDetailPage"));
const ProfileOrdersPage = lazy(() => import("@/features/order/ordering/pages/ProfileOrdersPage"));
const WishlistPage = lazy(() => import("@/features/order/wishlist/pages/WishlistPage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/pages/ForgotPasswordPage"));
const RoleSwitchPage = lazy(() => import("@/features/auth/pages/RoleSwitchPage"));
const SellerOnboardingPage = lazy(() => import("@/features/auth/pages/SellerOnboardingPage"));
const SellerDashboardPage = lazy(() => import("@/features/seller/dashboard/pages/SellerDashboardPage"));
const SellerProductsPage = lazy(() => import("@/features/seller/product/pages/SellerProductsPage"));
const SellerBannerPage = lazy(() => import("@/features/seller/banner/pages/SellerBannerPage"));
const SellerStorePage = lazy(() => import("@/features/seller/store/pages/SellerStorePage"));
const AdminDashboardPage = lazy(() => import("@/features/admin/dashboard/pages/AdminDashboardPage"));
const AdminCatalogGroupPage = lazy(() => import("@/features/admin/catalogGroup/pages/AdminCatalogGroupPage"));
const AdminCategoryPage = lazy(() => import("@/features/admin/category/pages/AdminCategoryPage"));
const ProfilePage = lazy(() => import("@/features/profile/identity/pages/ProfilePage"));
const AddressesPage = lazy(() => import("@/features/profile/address/pages/AddressesPage"));
const ChatPage = lazy(() => import("@/features/profile/chat/pages/ChatPage"));
const GroupChatPage = lazy(() => import("@/features/profile/chat/pages/GroupChatPage"));
const NotificationsPage = lazy(() => import("@/features/profile/notifications/pages/NotificationsPage"));
const PaymentsPage = lazy(() => import("@/features/profile/payments/pages/PaymentsPage"));
const VouchersPage = lazy(() => import("@/features/profile/vouchers/pages/VouchersPage"));

function LoadingScreen() {
  return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#03ac0e]" /></div>;
}

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<BuyerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/category/*" element={<CategoryPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/promotions" element={<PromotionPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
            </Route>
          </Route>

          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<LoginPage portal="buyer" />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/admin/login" element={<LoginPage portal="admin" />} />
            <Route path="/chat/login" element={<LoginPage portal="chat" />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/auth/role-switch" element={<RoleSwitchPage />} />
            <Route path="/auth/seller/onboarding" element={<SellerOnboardingPage />} />

            <Route element={<ProfileLayout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/orders" element={<ProfileOrdersPage />} />
              <Route path="/profile/addresses" element={<AddressesPage />} />
              <Route path="/profile/wishlist" element={<WishlistPage />} />
              <Route path="/profile/notifications" element={<NotificationsPage />} />
              <Route path="/profile/payments" element={<PaymentsPage />} />
              <Route path="/profile/vouchers" element={<VouchersPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/groups" element={<GroupChatPage />} />
            </Route>

            <Route path="/profile/chat" element={<Navigate to="/chat/login?redirect=/chat" replace />} />
            <Route path="/profile/groups" element={<Navigate to="/chat/login?redirect=/chat/groups" replace />} />
          </Route>

          <Route element={<ProtectedRoute roles={["seller"]} />}>
            <Route element={<SellerLayout />}>
              <Route path="/seller" element={<SellerDashboardPage />} />
              <Route path="/seller/products" element={<SellerProductsPage />} />
              <Route path="/seller/banners" element={<SellerBannerPage />} />
              <Route path="/seller/store" element={<SellerStorePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/catalog-groups" element={<AdminCatalogGroupPage />} />
              <Route path="/admin/categories" element={<AdminCategoryPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AppLayout>
  );
}
