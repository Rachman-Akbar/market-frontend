import { Routes, Route } from "react-router-dom";

import AppLayout from "@/shared/layout/AppLayout";
import HomePage from "@/features/catalog/HomePage";

import SearchPage from "@/features/catalog/product/pages/SearchPage";
import ProductDetailPage from "@/features/catalog/product/pages/ProductDetailPage";
import CategoryPage from "@/features/catalog/category/pages/CategoryPage";

import CartPage from "@/features/order/pages/CartPage";
import CheckoutPage from "@/features/order/pages/CheckoutPage";
import OrderDetailPage from "@/features/order/pages/OrderDetailPage";
import WishlistPage from "@/features/order/pages/WishlistPage";
import ProfileOrdersPage from "@/features/order/pages/ProfileOrdersPage";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import SellerDashboardPage from "@/features/seller/pages/SellerDashboardPage";

import AdminDashboardPage from "@/features/admin/pages/AdminDashboardPage";

import ProfileLayout from "@/features/user/components/ProfileLayout";
import ProfilePage from "@/features/user/pages/ProfilePage";
import AddressesPage from "@/features/user/pages/AddressesPage";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/seller" element={<SellerDashboardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/profile" element={<ProfileLayout><ProfilePage /></ProfileLayout>} />
        <Route path="/profile/orders" element={<ProfileLayout><ProfileOrdersPage /></ProfileLayout>} />
        <Route path="/profile/addresses" element={<ProfileLayout><AddressesPage /></ProfileLayout>} />
        <Route path="/profile/wishlist" element={<ProfileLayout><WishlistPage /></ProfileLayout>} />
      </Routes>
    </AppLayout>
  );
}