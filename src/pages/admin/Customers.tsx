import { useMemo, useState } from "react";
import { Search, Eye, UserCheck, UserX } from "lucide-react";
import { AdminPageHeader, AdminTable, StatusPill } from "@/components/admin/AdminUI";
import { DemoNote } from "@/components/ui/DemoNote";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SAMPLE_CUSTOMERS } from "@/data/admin";
import { formatDate, formatINR } from "@/lib/utils";

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  mobile: string;
  orders: number;
  spent: number;
  joined: string;
  blocked: boolean;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>(
    SAMPLE_CUSTOMERS.map((c) => ({ ...c, blocked: false }))
  );
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CustomerRow | null>(null);

  const filtered = useMemo(
    () =>
      [...customers]
        .filter((c) =>
          `${c.name} ${c.email} ${c.mobile}`.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => b.spent - a.spent),
    [customers, query]
  );

  const toggleBlocked = (id: string) => {
    setCustomers((current) =>
      current.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c))
    );
    setActive((current) =>
      current && current.id === id ? { ...current, blocked: !current.blocked } : current
    );
  };

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="Review sample customer records and manage account access. All records and figures are illustrative."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
            aria-label="Search customers"
            className="h-10 w-full border border-line bg-white pl-9 pr-3 text-[12px] outline-none focus:border-gold"
          />
        </div>
        <span className="ml-auto text-[10.5px] text-stone">{filtered.length} customers</span>
      </div>

      <AdminTable head={["Customer", "Contact", "Joined", "Orders", "Lifetime value", "Status", "Actions"]}>
        {filtered.map((customer) => (
          <tr key={customer.id} className="text-[11.5px]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-[10px] text-charcoal">
                  {customer.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <span className="font-medium text-ink">{customer.name}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              <p className="text-charcoal/65">{customer.email}</p>
              <p className="text-[9.5px] text-stone">{customer.mobile}</p>
            </td>
            <td className="px-4 py-3 text-charcoal/55">{formatDate(customer.joined)}</td>
            <td className="px-4 py-3 text-charcoal">{customer.orders}</td>
            <td className="px-4 py-3 text-ink">{formatINR(customer.spent)}</td>
            <td className="px-4 py-3">
              <StatusPill status={customer.blocked ? "Inactive" : "Active"} />
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActive(customer)}
                  aria-label={`View ${customer.name}`}
                  className="p-1.5 text-charcoal/60 hover:text-gold-dark"
                >
                  <Eye size={14} />
                </button>
                <button
                  onClick={() => toggleBlocked(customer.id)}
                  aria-label={customer.blocked ? `Reactivate ${customer.name}` : `Deactivate ${customer.name}`}
                  className="p-1.5 text-charcoal/60 hover:text-red-500"
                >
                  {customer.blocked ? <UserCheck size={14} /> : <UserX size={14} />}
                </button>
              </div>
            </td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-10 text-center text-[12px] text-stone">
              No customers match this search.
            </td>
          </tr>
        )}
      </AdminTable>

      <DemoNote className="mt-4">
        These customer records are fictional sample data. Customer accounts created in the
        storefront's demo mode are stored only in the browser and are not shown here.
        Account status changes are held in memory for this session.
      </DemoNote>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title="Customer profile" panelClassName="sm:max-w-lg">
        {active && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-serif text-base text-gold">
                  {active.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <p className="font-serif text-xl text-ink">{active.name}</p>
                  <p className="text-[10.5px] text-stone">Customer since {formatDate(active.joined)}</p>
                </div>
              </div>
              <StatusPill status={active.blocked ? "Inactive" : "Active"} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-[11.5px]">
              <div>
                <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">Email</dt>
                <dd className="mt-1 text-charcoal/75">{active.email}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">Mobile</dt>
                <dd className="mt-1 text-charcoal/75">{active.mobile}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">Orders</dt>
                <dd className="mt-1 text-charcoal/75">{active.orders}</dd>
              </div>
              <div>
                <dt className="text-[9px] uppercase tracking-[0.14em] text-stone">Lifetime value</dt>
                <dd className="mt-1 text-charcoal/75">{formatINR(active.spent)}</dd>
              </div>
            </dl>

            <div className="mt-6 border border-line bg-cream/60 p-3.5">
              <p className="text-[10px] uppercase tracking-[0.14em] text-stone">Account access</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-charcoal/60">
                {active.blocked
                  ? "This demo account is deactivated. It would be unable to place new orders."
                  : "This demo account is active."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => toggleBlocked(active.id)}
              >
                {active.blocked ? <UserCheck size={13} /> : <UserX size={13} />}
                {active.blocked ? "Reactivate account" : "Deactivate account"}
              </Button>
            </div>

            <p className="mt-4 text-[10px] text-stone">
              Demonstration only — no real account or login is affected.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
