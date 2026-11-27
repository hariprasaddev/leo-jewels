import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-charcoal/50">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-gold-dark">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink/80">{item.label}</span>
              )}
              {!isLast && <ChevronRight size={11} className="text-line" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
