import { Link } from "react-router-dom";
import { ChevronDown, Mail, PackageSearch, RotateCcw } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";

const GROUPS = [
  {
    title: "Orders & Payments",
    items: [
      {
        q: "Which payment methods can I use?",
        a: "The checkout interface supports UPI, credit/debit cards, net banking and Cash on Delivery. Online payment processing requires the Razorpay integration to be configured on the backend. Until then, this demonstration build can only create a demo Cash on Delivery order and will not simulate a successful online payment.",
      },
      {
        q: "Is my payment information stored?",
        a: "No card or UPI credentials are stored by LEO JEWELS. When live, payment details are handled entirely by the payment provider. In demo mode, no payment data is collected at all.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Orders can usually be changed or cancelled before dispatch. Contact customer care with your order ID as soon as possible. Once an order has shipped, our returns process applies.",
      },
      {
        q: "Do you offer Cash on Delivery?",
        a: "Cash on Delivery is available in the checkout interface. In this demo build it creates a clearly-labelled local demonstration order rather than a real shipment.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        q: "How long does delivery take?",
        a: "We aim to dispatch orders within 2–4 business days. Delivery timelines depend on your PIN code and are shown as an estimate at checkout. Bridal and made-to-order pieces may take longer; this will be stated on the product page.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Shipping is complimentary on orders above ₹4,999. Orders below that amount carry a flat ₹99 shipping fee, shown in your bag before payment.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Use the order tracking page with your order ID and the email or mobile number used at checkout. Live courier updates require the backend logistics integration.",
      },
      {
        q: "Do you ship outside India?",
        a: "This storefront is configured for delivery within India. International shipping is not enabled in this build.",
      },
    ],
  },
  {
    title: "Products & Care",
    items: [
      {
        q: "Are the gold purity and hallmark details listed?",
        a: "Where purity and hallmarking are supplied by the brand, they are confirmed before dispatch. This demonstration catalogue does not invent purity grades, hallmark numbers or certificates. Please ask our care team for certified details on any specific piece.",
      },
      {
        q: "How should I care for imitation jewellery?",
        a: "Keep imitation and plated pieces away from water, perfume and harsh cleaners. Store them in a dry pouch and wipe gently after wear to preserve the finish.",
      },
      {
        q: "Will the product look exactly like the photographs?",
        a: "We photograph pieces as accurately as possible. Slight variation in colour can occur due to screen settings and lighting. Dimensions and approximate weights are listed where available.",
      },
      {
        q: "Do you offer bridal consultations?",
        a: "Yes — our team can help coordinate bridal sets with your outfit and ceremony. Get in touch through the contact page and mention your wedding date and city.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return window?",
        a: "Unworn pieces in original packaging can be returned within 7 days of delivery. Customised, made-to-order and pierced-earring items may not be eligible. See the Return Policy for full details.",
      },
      {
        q: "How do refunds work?",
        a: "Once a return is received and inspected, refunds are processed to the original payment method. Cash on Delivery refunds are made via bank transfer. Timelines depend on your bank.",
      },
      {
        q: "Can I exchange a piece for a different size?",
        a: "Size exchanges are subject to stock availability. Contact care within the return window and we will confirm options.",
      },
    ],
  },
];

export function FAQ() {
  return (
    <div>
      <PageHero
        eyebrow="Help Centre"
        title="Frequently Asked Questions"
        description="Clear answers about orders, delivery, materials, care and returns."
        crumbs={[{ label: "Home", to: "/" }, { label: "FAQ" }]}
      />

      <div className="container-lux grid gap-12 py-14 lg:grid-cols-[220px_1fr] lg:gap-20 lg:py-20">
        <aside className="lg:sticky lg:top-[104px] lg:self-start">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone">On this page</p>
          <nav className="mt-4 hidden space-y-2.5 lg:block">
            {GROUPS.map((group) => (
              <a
                key={group.title}
                href={`#${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="block text-[12px] text-charcoal/65 transition-colors hover:text-gold-dark"
              >
                {group.title}
              </a>
            ))}
          </nav>
          <div className="mt-8 border border-line bg-cream p-4">
            <p className="font-serif text-lg text-ink">Still need help?</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-charcoal/60">
              Our care team is happy to assist with a specific piece or order.
            </p>
            <Link to="/contact" className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-gold-dark hover:text-ink">
              <Mail size={12} /> Contact us
            </Link>
          </div>
        </aside>

        <div className="space-y-12">
          {GROUPS.map((group) => (
            <section key={group.title} id={group.title.toLowerCase().replace(/[^a-z]+/g, "-")}>
              <h2 className="border-b border-line pb-3 font-serif text-2xl text-ink">{group.title}</h2>
              <div className="divide-y divide-line">
                {group.items.map((item) => (
                  <details key={item.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <span className="text-[13px] font-medium text-charcoal group-open:text-ink">{item.q}</span>
                      <ChevronDown size={16} className="mt-0.5 shrink-0 text-gold-dark transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 max-w-2xl pr-8 text-[12.5px] leading-[1.85] text-charcoal/60">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/order-tracking" className="group flex items-center gap-3 border border-line bg-white p-4 hover:border-gold">
              <PackageSearch size={18} className="text-gold-dark" />
              <span className="flex-1 text-[12px] text-ink">Track your order</span>
              <span className="text-gold-dark transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link to="/return-policy" className="group flex items-center gap-3 border border-line bg-white p-4 hover:border-gold">
              <RotateCcw size={18} className="text-gold-dark" />
              <span className="flex-1 text-[12px] text-ink">Returns & refunds</span>
              <span className="text-gold-dark transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
