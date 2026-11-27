import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Youtube,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { WhatsAppIcon } from "@/components/support/WhatsAppButton";
import { useCatalogue } from "@/context/CatalogueContext";

const shopLinks = [
  { label: "All Jewellery", to: "/shop" },
  { label: "New Arrivals", to: "/new-arrivals" },
  { label: "Bridal Collection", to: "/collections/bridal" },
  { label: "Necklace Sets", to: "/category/necklace-sets" },
  { label: "Earrings", to: "/category/earrings" },
  { label: "Bangles", to: "/category/bangles" },
  { label: "Best Sellers", to: "/collections/best-sellers" },
];

const serviceLinks = [
  { label: "Contact Us", to: "/contact" },
  { label: "Book a Consultation", to: "/book-consultation" },
  { label: "Track Your Order", to: "/track-order" },
  { label: "Frequently Asked Questions", to: "/faq" },
  { label: "My Account", to: "/account" },
];

const policyLinks = [
  { label: "Terms and Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Return and Refund Policy", to: "/return-policy" },
  { label: "Cancellation Policy", to: "/cancellation-policy" },
];

export function Footer() {
  const { settings } = useCatalogue();
  const whatsappNumber = settings.whatsapp.replace(/\D/g, "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello LEO JEWELS, I would like some assistance."
      )}`
    : undefined;
  const paymentMethods = settings.paymentMethods
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean);
  const socials = [
    { Icon: Instagram, label: "Instagram", href: settings.instagram },
    { Icon: Facebook, label: "Facebook", href: settings.facebook },
    { Icon: Youtube, label: "YouTube", href: settings.youtube },
  ].filter((social) => social.href.trim().length > 0);

  return (
    <footer className="bg-ink text-ivory">
      <div className="container-lux pt-14 lg:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="dark" size="md" />
            <p className="mt-4 font-serif text-lg italic text-gold">
              Where Elegance Meets Eternity.
            </p>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ivory/50">
              Considered jewellery for real life and rare occasions. Gold, silver,
              bridal and imitation collections, chosen for how they feel as much as
              how they look.
            </p>

            <ul className="mt-6 space-y-2.5 text-[11.5px] text-ivory/50">
              {settings.businessAddress && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-gold/70" />
                  <span>{settings.businessAddress}</span>
                </li>
              )}
              {settings.supportPhone && (
                <li>
                  <a
                    href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2.5 hover:text-gold"
                  >
                    <Phone size={13} className="shrink-0 text-gold/70" />
                    {settings.supportPhone}
                  </a>
                </li>
              )}
              {settings.supportEmail && (
                <li>
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="flex items-center gap-2.5 hover:text-gold"
                  >
                    <Mail size={13} className="shrink-0 text-gold/70" />
                    {settings.supportEmail}
                  </a>
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-2">
                {socials.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LEO JEWELS on ${label}`}
                    title={label}
                    className="flex h-9 w-9 items-center justify-center border border-ivory/15 text-ivory/70 transition-all duration-300 hover:border-gold hover:text-gold"
                  >
                    <Icon size={15} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <div>
            <p className="eyebrow text-gold">Customer Service</p>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-[12.5px] text-ivory/55 transition-colors duration-200 hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[12.5px] text-ivory/55 transition-colors hover:text-ivory"
                  >
                    <WhatsAppIcon size={13} /> WhatsApp Support
                  </a>
                ) : (
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 text-[12.5px] text-ivory/55 transition-colors hover:text-ivory"
                    title="Add the business WhatsApp number in the admin console to enable WhatsApp support."
                  >
                    <WhatsAppIcon size={13} /> WhatsApp Support
                  </Link>
                )}
              </li>
            </ul>
          </div>
          <FooterColumn title="Policies" links={policyLinks} />
        </div>

        <div className="mt-12 grid gap-8 border-t border-ivory/10 py-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div>
            <p className="eyebrow text-gold">Customer Care</p>
            <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-ivory/50">
              {settings.supportMessage ||
                "Questions about a piece, your order or a consultation? Write to our care team and we will help."}
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-gold transition-colors hover:text-gold-light"
            >
              Contact customer care <ArrowUpRight size={12} />
            </Link>
          </div>
          <div>
            <p className="eyebrow text-gold">The Inner Circle</p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ivory/50">
              New collections, styling notes and private previews — a few thoughtful
              emails, never noise.
            </p>
            <NewsletterForm variant="dark" className="mt-4" />
          </div>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-lux flex flex-col gap-4 py-5 text-[10px] text-ivory/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LEO JEWELS. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-label="Payment methods">
            {paymentMethods.map((method) => (
              <li key={method} className="border border-ivory/15 px-2 py-1 text-[9px] uppercase tracking-[0.1em]">
                {method}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LEO JEWELS on ${label}`}
                className="transition-colors hover:text-gold"
              >
                <Icon size={13} />
              </a>
            ))}
            <Link to="/faq" className="flex items-center gap-1.5 uppercase tracking-[0.18em] transition-colors hover:text-gold">
              Customer care <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-gold">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.to + link.label}>
            <Link
              to={link.to}
              className="text-[12.5px] text-ivory/55 transition-colors duration-200 hover:text-ivory"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
