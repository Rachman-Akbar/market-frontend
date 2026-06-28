export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface CatalogGroup {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  catalogGroupId: string;
  parentId?: string;
  level: 1 | 2 | 3;
  children?: Category[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  images: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  storeId: string;
  storeName: string;
  rating: number;
  reviewCount: number;
  sold: number;
  variants: ProductVariant[];
  images: string[];
  tags: string[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  bgColor: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  location: string;
  rating: number;
  totalSold: number;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  price: number;
  quantity: number;
  image: string;
  storeId: string;
  storeName: string;
}

export interface WishlistItem {
  productId: string;
  variantId: string;
  productName: string;
  price: number;
  image: string;
}

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  address: Address;
  shippingMethod: string;
  shippingCost: number;
  paymentMethod: string;
  subtotal: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export interface ShippingOption {
  id: string;
  courier: string;
  service: string;
  estimatedDays: string;
  price: number;
}
