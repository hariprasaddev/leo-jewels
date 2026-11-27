import { useState } from "react";
import { Plus, Trash2, Power } from "lucide-react";
import { AdminPageHeader, AdminTable, AdminField, StatusPill } from "@/components/admin/AdminUI";
import { DemoNote } from "@/components/ui/DemoNote";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SAMPLE_COUPONS } from "@/data/admin";
import { formatINR } from "@/lib/utils";

interface CouponRow {
  code: string;
  description: string;
  type: "Percent" | "Fixed";
  value: string;
  minOrder: number;
  active: boolean;
  uses: number;
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<CouponRow[]>(SAMPLE_COUPONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    code: "",
    type: "Percent" as CouponRow["type"],
    value: "",
    minOrder: "",
  });

  const addCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = draft.code.trim().toUpperCase();
    if (code.length < 3) {
      setError("Enter a coupon code of at least 3 characters.");
      return;
    }
    if (coupons.some((c) => c.code === code)) {
      setError("A coupon with this code already exists.");
      return;
    }
    const value = Number(draft.value);
    if (!value || value <= 0) {
      setError("Enter a valid discount value.");
      return;
    }
    if (draft.type === "Percent" && value > 90) {
      setError("Percentage discounts above 90% are not permitted.");
      return;
    }
    const minOrder = Number(draft.minOrder) || 0;
    setCoupons((current) => [
      {
        code,
        description: `${draft.type === "Percent" ? `${value}%` : formatINR(value)} off orders above ${formatINR(minOrder)}`,
        type: draft.type,
        value: draft.type === "Percent" ? `${value}%` : formatINR(value),
        minOrder,
        active: true,
        uses: 0,
      },
      ...current,
    ]);
    setModalOpen(false);
    setDraft({ code: "", type: "Percent", value: "", minOrder: "" });
    setError("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Create and manage discount codes. Only LEO10, FESTIVE15 and WELCOME500 work at storefront checkout."
        action={
          <Button size="sm" onClick={() => { setModalOpen(true); setError(""); }}>
            <Plus size={14} /> Create coupon
          </Button>
        }
      />

      <AdminTable head={["Code", "Description", "Type", "Min. order", "Uses", "Status", "Actions"]}>
        {coupons.map((coupon) => (
          <tr key={coupon.code} className="text-[11.5px]">
            <td className="px-4 py-3">
              <span className="border border-line bg-cream px-2 py-1 font-mono text-[10.5px] text-charcoal">
                {coupon.code}
              </span>
            </td>
            <td className="max-w-[260px] px-4 py-3 text-charcoal/65">{coupon.description}</td>
            <td className="px-4 py-3 text-charcoal/60">{coupon.type} · {coupon.value}</td>
            <td className="px-4 py-3 text-charcoal/60">{formatINR(coupon.minOrder)}</td>
            <td className="px-4 py-3 text-charcoal">{coupon.uses}</td>
            <td className="px-4 py-3"><StatusPill status={coupon.active ? "Active" : "Inactive"} /></td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCoupons((current) =>
                      current.map((c) => (c.code === coupon.code ? { ...c, active: !c.active } : c))
                    )
                  }
                  aria-label={coupon.active ? `Deactivate ${coupon.code}` : `Activate ${coupon.code}`}
                  className="p-1.5 text-charcoal/60 hover:text-gold-dark"
                >
                  <Power size={14} />
                </button>
                <button
                  onClick={() => setCoupons((current) => current.filter((c) => c.code !== coupon.code))}
                  aria-label={`Delete ${coupon.code}`}
                  className="p-1.5 text-charcoal/60 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <DemoNote className="mt-4">
        Coupons added here are demonstration records and do not affect checkout. Storefront
        coupon validation uses the bundled sample coupon list.
      </DemoNote>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create coupon" panelClassName="sm:max-w-lg">
        <form onSubmit={addCoupon} noValidate className="space-y-4 p-6">
          <AdminField id="coupon-code" label="Coupon code" value={draft.code} onChange={(v) => setDraft({ ...draft, code: v.toUpperCase() })} placeholder="SUMMER20" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="coupon-type" className="field-label">Discount type</label>
              <select
                id="coupon-type"
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as CouponRow["type"] })}
                className="field h-11 text-[12.5px]"
              >
                <option value="Percent">Percentage</option>
                <option value="Fixed">Fixed amount</option>
              </select>
            </div>
            <AdminField id="coupon-value" label={draft.type === "Percent" ? "Value (%)" : "Value (₹)"} value={draft.value} onChange={(v) => setDraft({ ...draft, value: v.replace(/\D/g, "") })} required />
          </div>
          <AdminField id="coupon-min" label="Minimum order (₹)" value={draft.minOrder} onChange={(v) => setDraft({ ...draft, minOrder: v.replace(/\D/g, "") })} />
          {error && <p className="text-[10.5px] text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1">Create coupon</Button>
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
