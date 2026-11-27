import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-charcoal/55">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className={cn("admin-card", accent && "bg-ink text-ivory")}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[9.5px] uppercase tracking-[0.18em]", accent ? "text-gold" : "text-stone")}>
          {label}
        </p>
        {icon && <span className={accent ? "text-gold" : "text-gold-dark"}>{icon}</span>}
      </div>
      <p className={cn("mt-3 font-serif text-3xl", accent ? "text-ivory" : "text-ink")}>{value}</p>
      <p className={cn("mt-2 text-[10.5px] leading-relaxed", accent ? "text-ivory/40" : "text-charcoal/50")}>
        {hint}
      </p>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Delivered" || status === "Paid" || status === "Active" || status === "Published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Cancelled" || status === "Hidden" || status === "Refunded" || status === "Inactive"
      ? "border-red-200 bg-red-50 text-red-600"
      : status === "Shipped" || status === "Packed"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-gold/40 bg-gold/10 text-gold-deep";

  return (
    <span className={cn("inline-block whitespace-nowrap border px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em]", tone)}>
      {status}
    </span>
  );
}

export function AdminTable({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-line bg-cream/50">
            {head.map((cell) => (
              <th key={cell} className="px-4 py-3 text-[8.5px] font-medium uppercase tracking-[0.14em] text-stone">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">{label}{required && " *"}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field h-11 text-[12.5px]"
      />
    </div>
  );
}
