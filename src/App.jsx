import { Routes, Route } from "react-router-dom";

import AppLayout from "@/shared/layout/AppLayout";
import BuyerLayout from "@/shared/layout/BuyerLayout";
import HomePage from "@/features/catalog/HomePage";
import SearchPage from "@/features/catalog/product/pages/SearchPage";
import ProductDetailPage from "@/features/catalog/product/pages/ProductDetailPage";
import CategoryPage from "@/features/catalog/category/pages/CategoryPage";
import PromotionPage from "@/features/catalog/promotion/pages/PromotionPage";

import CartPage from "@/features/order/cart/pages/CartPage";
import CheckoutPage from "@/features/order/ordering/pages/CheckoutPage";
import OrderDetailPage from "@/features/order/ordering/pages/OrderDetailPage";
import ProfileOrdersPage from "@/features/order/ordering/pages/ProfileOrdersPage";
import WishlistPage from "@/features/order/wishlist/pages/WishlistPage";

import AuthLayout from "@/features/auth/AuthLayout";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import SellerLayout from "@/features/seller/SellerLayout";
import SellerDashboardPage from "@/features/seller/dashboard/pages/SellerDashboardPage";
import SellerProductsPage from "@/features/seller/product/pages/SellerProductsPage";
import SellerBannerPage from "@/features/seller/banner/pages/SellerBannerPage";
import SellerStorePage from "@/features/seller/store/pages/SellerStorePage";

import AdminLayout from "@/features/admin/AdminLayout";
import AdminDashboardPage from "@/features/admin/dashboard/pages/AdminDashboardPage";
import AdminCatalogGroupPage from "@/features/admin/catalogGroup/pages/AdminCatalogGroupPage";
import AdminCategoryPage from "@/features/admin/category/pages/AdminCategoryPage";

import ProfileLayout from "@/features/profile/ProfileLayout";
import ProfilePage from "@/features/profile/identity/pages/ProfilePage";
import AddressesPage from "@/features/profile/address/pages/AddressesPage";
import ChatPage from "@/features/profile/chat/pages/ChatPage";
import GroupChatPage from "@/features/profile/chat/pages/GroupChatPage";
import NotificationsPage from "@/features/profile/notifications/pages/NotificationsPage";
import PaymentsPage from "@/features/profile/payments/pages/PaymentsPage";
import VouchersPage from "@/features/profile/vouchers/pages/VouchersPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route element={<BuyerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/*" element={<CategoryPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/promotions" element={<PromotionPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>

        <Route element={<SellerLayout />}>
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/banners" element={<SellerBannerPage />} />
          <Route path="/seller/store" element={<SellerStorePage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/catalog-groups" element={<AdminCatalogGroupPage />} />
          <Route path="/admin/categories" element={<AdminCategoryPage />} />
        </Route>

        <Route element={<ProfileLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders" element={<ProfileOrdersPage />} />
          <Route path="/profile/addresses" element={<AddressesPage />} />
          <Route path="/profile/wishlist" element={<WishlistPage />} />
          <Route path="/profile/chat" element={<ChatPage />} />
          <Route path="/profile/groups" element={<GroupChatPage />} />
          <Route path="/profile/notifications" element={<NotificationsPage />} />
          <Route path="/profile/payments" element={<PaymentsPage />} />
          <Route path="/profile/vouchers" element={<VouchersPage />} />
        </Route>
      </Routes>
    </AppLayout>
  );
}