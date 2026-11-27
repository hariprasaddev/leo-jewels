import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/adminAuth";

export { clearAdminSession } from "@/lib/adminAuth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getAdminSession()) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
