import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  useSellerStore,
  useSellerStoreAddress,
} from "@/features/seller/store/services/sellerStoreService";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#10B981]" />
    </div>
  );
}

function isOperationalProfileComplete(store) {
  const detail = store?.detail || {};
  const required = [
    detail.openDays,
    detail.openTime,
    detail.closeTime,
    detail.shippingPolicy,
    detail.returnPolicy,
  ];

  return required.every((value) => String(value || "").trim());
}

export default function SellerOnboardingGuard({ children }) {
  const location = useLocation();
  const { store: sessionStore } = useAuth();
  const storeQuery = useSellerStore();
  const addressQuery = useSellerStoreAddress();

  if (!sessionStore?.id) {
    return (
      <Navigate
        to="/auth/seller/onboarding"
        state={{ from: location, reason: "store_missing" }}
        replace
      />
    );
  }

  if (storeQuery.isLoading || addressQuery.isLoading) {
    return <LoadingScreen />;
  }

  const store = storeQuery.data;
  const address = addressQuery.data;
  const isComplete = Boolean(
    store?.id && address?.id && isOperationalProfileComplete(store),
  );

  if (!isComplete) {
    return (
      <Navigate
        to="/auth/seller/onboarding"
        state={{ from: location, reason: "onboarding_incomplete" }}
        replace
      />
    );
  }

  return children || <Outlet />;
}
