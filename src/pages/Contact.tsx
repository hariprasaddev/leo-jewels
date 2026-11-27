import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Check, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { DemoNote } from "@/components/ui/DemoNote";
import { cn, isValidEmail } from "@/lib/utils";
import { useCatalogue } from "@/context/CatalogueContext";
import { contactService } from "@/services/contactService";


export function Contact() {
  const { settings, sectionImages } = useCatalogue();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Order enquiry", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 15) next.message = "Please add a little more detail (at least 15 characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus("sending");
    setSubmitError("");
    try {
      await contactService.send({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject,
        message: form.message.trim(),
      });
      setStatus("sent");
    } catch (error) {
      setStatus("idle");
      setSubmitError(error instanceof Error ? error.message : "Unable to send your message.");
    }
  };

  return (
    <div>
      <PageHero
        eyebrow="We're Here To Help"
        title="Contact LEO JEWELS"
        description="Questions about a piece, an order or a delivery? Write to us and we'll do our best to help."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact Us" }]}
        image={sectionImages.contactBanner}
      />

      <div className="container-lux grid gap-12 py-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20 lg:py-20">
        <div>
          <h2 className="font-serif text-2xl text-ink">Our studio</h2>
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-charcoal/60">
            For order queries, please include your order ID. Business hours and contact
            details are set by the store owner in the admin console.
          </p>
          <div className="mt-8 space-y-5">
            {[
              {
                icon: MapPin,
                title: "Business address",
                line1: settings.businessAddress || "Not yet configured",
                line2: settings.businessAddress
                  ? "As registered by the store owner"
                  : "Add this in the admin console",
              },
              {
                icon: Mail,
                title: "Email",
                line1: settings.supportEmail || "Not yet configured",
                line2: settings.supportEmail
                  ? "We reply as soon as we can"
                  : "Add this in the admin console",
                href: settings.supportEmail ? `mailto:${settings.supportEmail}` : undefined,
              },
              {
                icon: Phone,
                title: "Phone",
                line1: settings.supportPhone || "Not yet configured",
                line2: settings.supportPhone
                  ? "During store hours"
                  : "Add this in the admin console",
                href: settings.supportPhone
                  ? `tel:${settings.supportPhone.replace(/\s/g, "")}`
                  : undefined,
              },
              {
                icon: Clock,
                title: "WhatsApp",
                line1: settings.whatsapp || "Not yet configured",
                line2: settings.whatsapp
                  ? "Message us during store hours"
                  : "Add this in the admin console",
                href: settings.whatsapp
                  ? `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`
                  : undefined,
              },
            ].map(({ icon: Icon, title, line1, line2, href }) => (
              <div key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-gold-dark">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-stone">{title}</p>
                  {href ? (
                    <a href={href} className="mt-1 block text-[13px] text-ink hover:text-gold-dark">{line1}</a>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink">{line1}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-charcoal/50">{line2}</p>
                </div>
              </div>
            ))}
          </div>
          <DemoNote className="mt-8">
            Contact details come from the store settings and are left blank until the
            owner supplies them. This demonstration form does not transmit messages to a
            real support inbox.
          </DemoNote>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[11px] text-charcoal/60">Looking for a quick answer?</p>
            <Link to="/faq" className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-gold-dark hover:text-ink">
              Read our FAQ <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="border border-line bg-white p-6 sm:p-8">
          {status === "sent" ? (
            <div className="flex h-full flex-col items-start justify-center py-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                <Check size={22} className="text-gold-dark" />
              </span>
              <h2 className="mt-5 font-serif text-2xl text-ink">Thank you for writing</h2>
              <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-charcoal/60">
                Your message has been saved in this browser for this demo. It has not been
                sent to a support inbox; a production backend is required for that.
              </p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setForm({ name: "", email: "", phone: "", subject: "Order enquiry", message: "" });
                }}
                className="btn-outline mt-6"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl text-ink">Send a message</h2>
              <p className="mt-1.5 text-[12px] text-charcoal/55">
                Fields marked * are required.
              </p>
              <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="field-label">Full name *</label>
                    <input
                      id="contact-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={cn("field", errors.name && "field-error")}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="mt-1.5 text-[11px] text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="field-label">Mobile number</label>
                    <input
                      id="contact-phone"
                      value={form.phone}
                      inputMode="numeric"
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      className="field"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="field-label">Email address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={cn("field", errors.email && "field-error")}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1.5 text-[11px] text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-subject" className="field-label">Subject</label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="field"
                  >
                    <option>Order enquiry</option>
                    <option>Product information</option>
                    <option>Shipping & delivery</option>
                    <option>Returns & refunds</option>
                    <option>Bridal consultation</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="field-label">Message *</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={cn("field h-auto resize-none py-3", errors.message && "field-error")}
                    placeholder="Tell us how we can help…"
                  />
                  {errors.message && <p className="mt-1.5 text-[11px] text-red-500">{errors.message}</p>}
                </div>
                {submitError && (
                  <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[11.5px] text-red-700">
                    {submitError}
                  </div>
                )}
                <button type="submit" disabled={status === "sending"} className="btn-primary w-full sm:w-auto">
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
