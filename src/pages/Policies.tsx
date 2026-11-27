import { Link } from "react-router-dom";
import type { PolicyKind } from "@/types";
import { PageHero } from "@/components/layout/PageHero";
import { DemoNote } from "@/components/ui/DemoNote";
import { useCatalogue } from "@/context/CatalogueContext";

const LINKS: { kind: PolicyKind; label: string; to: string }[] = [
  { kind: "shipping", label: "Shipping", to: "/shipping-policy" },
  { kind: "returns", label: "Returns & Refunds", to: "/return-policy" },
  { kind: "cancellation", label: "Cancellation", to: "/cancellation-policy" },
  { kind: "payment", label: "Payments", to: "/payment-policy" },
  { kind: "privacy", label: "Privacy", to: "/privacy-policy" },
  { kind: "terms", label: "Terms & Conditions", to: "/terms" },
];

export function Policies({ kind }: { kind: PolicyKind }) {
  const { getPolicy, settings } = useCatalogue();
  const policy = getPolicy(kind);

  if (!policy) {
    return (
      <div className="container-lux py-20 text-center">
        <h1 className="font-serif text-2xl text-ink">Policy unavailable</h1>
        <p className="mt-2 text-[12.5px] text-stone">
          This policy page has not been published yet.
        </p>
        <Link to="/contact" className="btn-outline mt-6 inline-block">
          Contact customer care
        </Link>
      </div>
    );
  }

  const fill = (text: string) =>
    text.replace(/\{\{supportEmail\}\}/g, settings.supportEmail || "our support email");

  return (
    <div>
      <PageHero
        eyebrow={policy.eyebrow}
        title={policy.title}
        description={fill(policy.description)}
        crumbs={[{ label: "Home", to: "/" }, { label: policy.title }]}
      />

      <div className="container-lux grid gap-12 py-14 lg:grid-cols-[220px_1fr] lg:gap-20 lg:py-20">
        <aside className="lg:sticky lg:top-[104px] lg:self-start">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone">Policies</p>
          <nav className="mt-4 flex flex-wrap gap-x-5 gap-y-2 lg:flex-col lg:gap-2.5">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={
                  link.kind === kind
                    ? "text-[12px] text-gold-dark"
                    : "text-[12px] text-charcoal/65 transition-colors hover:text-gold-dark"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="mt-7 text-[10.5px] text-stone">Last updated {policy.updated}</p>
        </aside>

        <article className="max-w-2xl">
          <div className="space-y-9">
            {policy.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-serif text-xl text-ink">{section.heading}</h2>
                <div className="mt-2.5 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-[12.5px] leading-[1.9] text-charcoal/65">
                      {fill(paragraph)}
                    </p>
                  ))}
                </div>
                {section.list && (
                  <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[12.5px] leading-relaxed text-charcoal/65 marker:text-gold">
                    {section.list.map((item) => (
                      <li key={item}>{fill(item)}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <DemoNote className="mt-10">
            This policy is sample content for a demonstration storefront and is not legal
            advice. Edit it in the admin console and review it with your own advisors
            before operating a real store. Any registered business details you add are
            shown exactly as entered.
          </DemoNote>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-6 text-[11px] text-charcoal/60">
            <Link to="/contact" className="underline underline-offset-4 hover:text-gold-dark">Contact customer care</Link>
            <Link to="/faq" className="underline underline-offset-4 hover:text-gold-dark">Read the FAQ</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
