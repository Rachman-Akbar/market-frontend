# Marketplace Project - Agents Documentation

## Overview
This project is a full-featured e-commerce marketplace platform, similar to Tokopedia or other popular marketplaces. It allows users to browse products, manage stores, place orders based on product variants, and includes comprehensive seller and admin functionalities.

The system supports hierarchical categorization with **Catalog Groups** and **Categories (Level 1-3)**, flexible **Product Variants**, and a complete order flow from cart to order details.

## Core Architecture
- **Frontend**: [To be specified, e.g., React/Next.js]
- **Backend**: [To be specified, e.g., Node.js/NestJS or Laravel]
- **Database**: [To be specified, e.g., PostgreSQL/MySQL]
- **Authentication**: General email/password + Google OAuth

## Main Features

### 1. Product and Variants
- Products can have multiple variants (e.g., size, color, material).
- Each variant has its own price, stock, SKU, and images.
- Support for variant-specific ordering.

### 2. Category
- Hierarchical categories up to Level 3.
- Categories are organized under Catalog Groups.

### 3. Catalog Groups
- Top-level grouping for categories.
- Helps in organizing the entire catalog structure (e.g., Electronics, Fashion, Home & Living).

### 4. Banner for Promotions
- Dynamic promotional banners on homepage, category pages, etc.
- Support for scheduled promotions and targeted displays.

### 5. Authentication
- General authentication (email/password, registration, password reset).
- Social login with Google provider.
- Role-based access (Buyer, Seller, Admin).

### 6. Cart, Order, and Order Detail
- Shopping cart with support for multiple variants.
- Order creation with shipping address, payment integration.
- Detailed order history and status tracking (Pending, Processing, Shipped, Delivered, Cancelled).

### 7. Store
- Multi-vendor marketplace (each seller has their own store).
- Store profile, product listing per store.

## Additional Features

### 1. Wishlist
- Users can save products/variants to wishlist for later purchase.

### 2. Voucher / Discount
- Voucher system for discounts (percentage or fixed amount).
- Applicable at cart or product level.
- Usage limits, expiration dates.

### 3. Chat
- Real-time chat between buyers and sellers.
- Possibly integrated with order chat for support.

### 4. Profile
- User profile management (personal info, addresses, order history).
- Seller profile enhancements.

### 5. Store Seller
- Seller dashboard for managing products, orders, store settings.
- Inventory management, sales analytics.

### 6. Admin Panel
- Comprehensive admin dashboard.
- Manage users, stores, products, categories, catalog groups, banners, vouchers, disputes, etc.
- System-wide analytics and moderation tools.

## User Roles
1. **Buyer/Customer**
   - Browse products, search, filter by category/catalog.
   - Add to cart/wishlist, checkout.
   - Manage orders and profile.

2. **Seller**
   - Manage own store and products.
   - Handle orders and chat with buyers.
   - View sales reports.

3. **Admin**
   - Full control over the platform.
   - Approve sellers, manage catalog, handle promotions, etc.

## Key Flows
- **Product Discovery**: Catalog Groups → Categories (L1-L3) → Products → Variants
- **Shopping**: Add variant to cart → Checkout → Order → Payment → Tracking
- **Seller Onboarding**: Register as seller → Create store → Upload products
- **Promotion**: Admin/Seller creates banners/vouchers → Displayed to users

## Technologies & Best Practices
- Scalable architecture for high traffic.
- Secure payment integration.
- Responsive design (mobile-first).
- Caching and search optimization (Elasticsearch recommended).
- Logging and monitoring.

---

**Note**: This document serves as a high-level overview for AI agents or developers working on the project. Update as features evolve.

## Next Steps / TODO
- Define database schema (ERD)
- API documentation (OpenAPI/Swagger)
- UI/UX wireframes
- Integration details (payment gateway, email service, etc.)