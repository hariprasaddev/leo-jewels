import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tags,
  Star,
  Ticket,
  Image,
  LayoutTemplate,
  FileText,
  Store,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  UserCog,
  Video,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { clearAdminSession } from "@/components/admin/AdminGuard";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products & Inventory", icon: Package },
  { to: "/admin/orders", label: "Orders & Tracking", icon: ShoppingCart },
  { to: "/admin/consultations", label: "Consultation Bookings", icon: Video },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/media", label: "Media Library", icon: Image },
  { to: "/admin/content", label: "Storefront Content", icon: LayoutTemplate },
  { to: "/admin/policies", label: "Policies", icon: FileText },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/account", label: "Admin Account", icon: UserCog },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-cream/50">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-ink px-4 py-3 lg:hidden">
        <Logo variant="dark" size="sm" withTagline={false} to="/admin" />
        <div className="flex items-center gap-2">
          <Link to="/" className="p-2 text-ivory/60 hover:text-gold" aria-label="View storefront">
            <Store size={17} />
          </Link>
          <button onClick={() => setOpen(true)} className="p-2 text-ivory" aria-label="Open admin menu">
            <Menu size={20} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-ivory/10 px-5 py-5">
            <div>
              <Logo variant="dark" size="sm" withTagline={false} to="/admin" />
              <p className="mt-2 text-[8px] uppercase tracking-[0.24em] text-gold/70">Admin Console</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-ivory/60 lg:hidden" aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "mb-0.5 flex items-center gap-3 px-3 py-2.5 text-[11.5px] transition-colors",
                    isActive
                      ? "bg-gold/15 text-gold"
                      : "text-ivory/55 hover:bg-ivory/5 hover:text-ivory"
                  )
                }
              >
                <Icon size={16} strokeWidth={1.6} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-ivory/10 p-3">
            <div className="mb-3 border border-gold/20 bg-gold/[0.06] px-3 py-2.5">
              <p className="text-[8.5px] uppercase tracking-[0.18em] text-gold">Sample data</p>
              <p className="mt-1 text-[10px] leading-relaxed text-ivory/40">
                Analytics and orders are illustrative, not live business data.
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 text-[11px] text-ivory/55 hover:text-gold"
            >
              <span className="flex items-center gap-2.5"><Store size={15} /> View storefront</span>
              <ArrowUpRight size={13} />
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-[11px] text-ivory/55 hover:text-red-300"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {open && (
          <button
            className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close admin menu"
          />
        )}

        <div className="min-w-0 flex-1">
          <header className="hidden items-center justify-between border-b border-line bg-white px-8 py-4 lg:flex">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-stone">LEO JEWELS</p>
              <p className="text-[13px] font-medium text-ink">Store administration</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="border border-gold/40 bg-gold/10 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.14em] text-gold-deep">
                Local admin
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[10px] text-gold">
                AD
              </div>
            </div>
          </header>
          <main className="p-5 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
