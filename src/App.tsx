import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import { Home } from "@/pages/Home";
import { CollectionPage } from "@/pages/CollectionPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { NewArrivals } from "@/pages/NewArrivals";
import { Shop } from "@/pages/Shop";
import { BookConsultation } from "@/pages/BookConsultation";
import { ProductDetail } from "@/pages/ProductDetail";
import { SearchPage } from "@/pages/SearchPage";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { Wishlist } from "@/pages/Wishlist";
import { OrderTracking } from "@/pages/OrderTracking";
import { OrderConfirmation } from "@/pages/OrderConfirmation";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { FAQ } from "@/pages/FAQ";
import { Policies } from "@/pages/Policies";
import { NotFound } from "@/pages/NotFound";

import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { Account } from "@/pages/auth/Account";

import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminConsultations } from "@/pages/admin/Consultations";
import { AdminCustomers } from "@/pages/admin/Customers";
import { AdminCategories } from "@/pages/admin/CategoriesAdmin";
import { AdminReviews } from "@/pages/admin/Reviews";
import { AdminCoupons } from "@/pages/admin/Coupons";
import { AdminMedia } from "@/pages/admin/Media";
import { AdminContent } from "@/pages/admin/Content";
import { AdminPolicies } from "@/pages/admin/PoliciesAdmin";
import { AdminAccount } from "@/pages/admin/Account";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collections/:slug" element={<CollectionPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="bridal" element={<Navigate to="/collections/bridal" replace />} />
          <Route path="new-arrivals" element={<NewArrivals />} />
          <Route path="shop" element={<Shop />} />
          <Route path="book-consultation" element={<BookConsultation />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="order-tracking" element={<OrderTracking />} />
          <Route path="track-order" element={<OrderTracking />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="shipping-policy" element={<Policies kind="shipping" />} />
          <Route path="return-policy" element={<Policies kind="returns" />} />
          <Route path="cancellation-policy" element={<Policies kind="cancellation" />} />
          <Route path="payment-policy" element={<Policies kind="payment" />} />
          <Route path="privacy-policy" element={<Policies kind="privacy" />} />
          <Route path="terms" element={<Policies kind="terms" />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="consultations" element={<AdminConsultations />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="policies" element={<AdminPolicies />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="account" element={<AdminAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
