import { useMemo } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingCart, Package, Users, ArrowUpRight, AlertTriangle } from "lucide-react";
import { AdminPageHeader, StatCard, StatusPill, AdminTable } from "@/components/admin/AdminUI";
import { DemoNote } from "@/components/ui/DemoNote";
import { SAMPLE_MONTHLY_REVENUE, SAMPLE_ORDERS, SAMPLE_CUSTOMERS, LOW_STOCK_THRESHOLD } from "@/data/admin";
import { useCatalogue } from "@/context/CatalogueContext";
import { orderService } from "@/services/orderService";
import { formatDate, formatINR } from "@/lib/utils";

export function AdminDashboard() {
  const { products } = useCatalogue();
  const localOrders = orderService.allOrders();
  const allOrders = [...localOrders, ...SAMPLE_ORDERS];

  const revenue = useMemo(
    () => allOrders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0),
    [allOrders]
  );
  const lowStock = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD).sort((a, b) => a.stock - b.stock);
  const maxRevenue = Math.max(...SAMPLE_MONTHLY_REVENUE.map((m) => m.revenue));

  return (
    <div>
      <AdminPageHeader
        title="Dashboard overview"
        description="A snapshot of store activity. Figures combine sample analytics with any demo orders placed in this browser."
        action={
          <span className="border border-gold/40 bg-gold/10 px-3 py-1.5 text-[8.5px] uppercase tracking-[0.14em] text-gold-deep">
            Sample analytics
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue summary"
          value={formatINR(revenue)}
          hint="Total of non-cancelled sample + local demo orders"
          icon={<IndianRupee size={18} strokeWidth={1.5} />}
          accent
        />
        <StatCard
          label="Total orders"
          value={String(allOrders.length)}
          hint={`${localOrders.length} placed in this browser · ${SAMPLE_ORDERS.length} sample`}
          icon={<ShoppingCart size={18} strokeWidth={1.5} />}
        />
        <StatCard
          label="Product count"
          value={String(products.length)}
          hint={`${lowStock.length} pieces at or below ${LOW_STOCK_THRESHOLD} units`}
          icon={<Package size={18} strokeWidth={1.5} />}
        />
        <StatCard
          label="Customer count"
          value={String(SAMPLE_CUSTOMERS.length)}
          hint="Sample customer records — no real users"
          icon={<Users size={18} strokeWidth={1.5} />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="admin-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl text-ink">Revenue trend</h2>
              <p className="mt-0.5 text-[10.5px] text-stone">Illustrative sample data · last 6 months</p>
            </div>
            <span className="text-[9px] uppercase tracking-[0.14em] text-stone">INR</span>
          </div>
          <div className="mt-8 flex h-52 items-end gap-3 sm:gap-5">
            {SAMPLE_MONTHLY_REVENUE.map((month) => (
              <div key={month.month} className="group flex h-full flex-1 flex-col items-center justify-end">
                <span className="mb-2 text-[9px] text-stone opacity-0 transition-opacity group-hover:opacity-100">
                  {formatINR(month.revenue)}
                </span>
                <div
                  className="w-full max-w-14 bg-gradient-to-t from-gold-deep/80 to-gold transition-opacity group-hover:opacity-80"
                  style={{ height: `${Math.max(8, (month.revenue / maxRevenue) * 100)}%` }}
                  role="img"
                  aria-label={`${month.month}: ${formatINR(month.revenue)}`}
                />
                <span className="mt-2 text-[9.5px] text-charcoal/60">{month.month}</span>
                <span className="text-[8.5px] text-stone">{month.orders} orders</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl text-ink">Low stock</h2>
              <p className="mt-0.5 text-[10.5px] text-stone">Pieces that need attention</p>
            </div>
            <AlertTriangle size={17} className="text-gold-dark" />
          </div>
          <ul className="mt-4 divide-y divide-line/70">
            {lowStock.slice(0, 5).map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-ink">{product.name}</p>
                  <p className="text-[9.5px] text-stone">{product.sku}</p>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.1em] text-gold-deep">
                  {product.stock} left
                </span>
              </li>
            ))}
            {lowStock.length === 0 && (
              <li className="py-4 text-[11.5px] text-stone">All pieces are comfortably in stock.</li>
            )}
          </ul>
          <Link to="/admin/products" className="mt-4 inline-flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-gold-dark hover:text-ink">
            Manage inventory <ArrowUpRight size={12} />
          </Link>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Recent orders</h2>
          <Link to="/admin/orders" className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.14em] text-gold-dark hover:text-ink">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <AdminTable head={["Order", "Customer", "Date", "Total", "Status", "Source"]}>
          {allOrders.slice(0, 6).map((order) => (
            <tr key={order.id} className="text-[11.5px]">
              <td className="px-4 py-3 font-medium text-ink">{order.id}</td>
              <td className="px-4 py-3 text-charcoal/65">{order.customer.fullName}</td>
              <td className="px-4 py-3 text-charcoal/55">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3 text-ink">{formatINR(order.total)}</td>
              <td className="px-4 py-3"><StatusPill status={order.status} /></td>
              <td className="px-4 py-3 text-[9.5px] uppercase tracking-[0.1em] text-stone">
                {localOrders.some((o) => o.id === order.id) ? "This browser" : "Sample"}
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <DemoNote className="mt-5">
        All dashboard figures are demonstration data. Revenue and order totals are not real
        business results. Changes made in the admin screens are held in memory for this
        session only.
      </DemoNote>
    </div>
  );
}
