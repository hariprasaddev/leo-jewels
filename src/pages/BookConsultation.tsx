import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock,
  Sparkles,
  UserRound,
  Video,
  ArrowRight,
} from "lucide-react";
import type { ConsultationBooking, ConsultationType } from "@/types";
import { consultationService } from "@/services/consultationService";
import { useCatalogue } from "@/context/CatalogueContext";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DemoNote } from "@/components/ui/DemoNote";
import { cn, formatDate, isValidEmail, isValidIndianMobile } from "@/lib/utils";

const TYPES: ConsultationType[] = [
  "Bridal Jewellery Consultation",
  "Product Selection Assistance",
  "Custom Jewellery Enquiry",
  "General Jewellery Consultation",
];

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
};

const prettyTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export function BookConsultation() {
  const [searchParams] = useSearchParams();
  const { categories, publishedProducts } = useCatalogue();
  const availability = consultationService.availability();
  const requestedSlug = searchParams.get("product");
  const requestedProduct = publishedProducts.find((product) => product.slug === requestedSlug);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    date: "",
    time: "",
    type: TYPES[0] as ConsultationType,
    category: requestedProduct
      ? categories.find((category) => category.slug === requestedProduct.category)?.name ??
        ""
      : "",
    productReference: requestedProduct?.name ?? "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<ConsultationBooking | null>(null);

  const bookedSlots = useMemo(
    () => (form.date ? consultationService.bookedSlots(form.date) : []),
    [form.date]
  );
  const dateBlocked = form.date ? availability.blockedDates.includes(form.date) : false;

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidIndianMobile(form.mobile)) next.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.date) next.date = "Choose a preferred date.";
    else if (dateBlocked) next.date = "We are unavailable on this date. Please choose another.";
    if (!form.time) next.time = "Choose an available time slot.";
    if (!form.category.trim()) next.category = "Choose a jewellery category or 'Not sure yet'.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const created = await consultationService.book({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        date: form.date,
        time: form.time,
        type: form.type,
        category: form.category.trim(),
        productReference: form.productReference.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setBooking(created);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Unable to reserve this slot.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) {
    return (
      <div className="container-lux py-8 lg:py-12">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Book a Consultation" }]} />
        <div className="mx-auto mt-8 max-w-2xl border border-line bg-white p-6 sm:p-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15">
            <Check size={24} className="text-gold-dark" />
          </span>
          <p className="eyebrow mt-5">Request received</p>
          <h1 className="mt-2 font-serif text-3xl text-ink">Your consultation is reserved</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-charcoal/65">
            Thank you, {booking.fullName.split(" ")[0]}. Your request is with our jewellery
            team. We will confirm the appointment and share a video meeting link by email.
          </p>

          <dl className="mt-6 grid gap-4 border-y border-line py-5 sm:grid-cols-2">
            <Detail label="Reference" value={booking.id} />
            <Detail label="Status" value={booking.status} />
            <Detail label="Date" value={formatDate(booking.date)} />
            <Detail label="Time" value={prettyTime(booking.time)} />
            <Detail label="Consultation" value={booking.type} />
            <Detail label="Category" value={booking.category} />
          </dl>

          <div className="mt-5 flex items-start gap-2.5 border border-line bg-cream/60 p-4 text-[11.5px] leading-relaxed text-charcoal/65">
            <Video size={15} className="mt-0.5 shrink-0 text-gold-dark" />
            <p>
              A video meeting link is added by our team after approval. We do not claim a
              live video call is ready until a meeting provider link has been configured.
            </p>
          </div>

          <DemoNote className="mt-4">
            Demo build: this request is stored in this browser and cannot reach the LEO
            JEWELS team. A production backend is required for real appointment management.
          </DemoNote>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/account?tab=consultations" className="btn-primary">
              View my consultations <ArrowRight size={14} />
            </Link>
            <Link to="/" className="btn-outline">Continue browsing</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-line bg-cream/60">
        <div className="container-lux py-10 lg:py-14">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Book a Consultation" }]} />
          <div className="mt-5 max-w-2xl">
            <p className="eyebrow">Personal Appointment</p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-5xl">
              Experience Jewellery, Personally
            </h1>
            <p className="mt-4 text-[13.5px] leading-relaxed text-charcoal/65">
              Not sure which design suits your occasion? Connect with our jewellery
              specialists through a personal video consultation — from bridal sets to
              everyday pieces.
            </p>
          </div>
        </div>
      </div>

      <div className="container-lux grid gap-10 py-10 lg:grid-cols-[1fr_330px] lg:gap-16 lg:py-14">
        <form onSubmit={submit} noValidate>
          <section>
            <h2 className="font-serif text-2xl text-ink">1. Choose your consultation</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {TYPES.map((type) => (
                <label
                  key={type}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                    form.type === type
                      ? "border-gold bg-gold/[0.06]"
                      : "border-line bg-white hover:border-charcoal/30"
                  )}
                >
                  <input
                    type="radio"
                    name="consultation-type"
                    checked={form.type === type}
                    onChange={() => set("type", type)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[#C6A15B]"
                  />
                  <span className="text-[12px] leading-snug text-ink">{type}</span>
                </label>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="consult-category" label="Jewellery category" error={errors.category}>
                <select
                  id="consult-category"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={cn("field", errors.category && "field-error")}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </Field>
              <Field id="consult-product" label="Product reference (optional)">
                <input
                  id="consult-product"
                  value={form.productReference}
                  onChange={(e) => set("productReference", e.target.value)}
                  placeholder="Product name or link"
                  className="field"
                />
              </Field>
            </div>
          </section>

          <section className="mt-9 border-t border-line pt-8">
            <h2 className="font-serif text-2xl text-ink">2. Select a date and time</h2>
            <p className="mt-1.5 text-[12px] text-charcoal/55">
              All times are India Standard Time. Slots already reserved by another customer
              are unavailable.
            </p>
            <div className="mt-5 max-w-xs">
              <Field id="consult-date" label="Preferred date" error={errors.date}>
                <input
                  id="consult-date"
                  type="date"
                  min={today()}
                  value={form.date}
                  onChange={(e) => {
                    set("date", e.target.value);
                    setForm((current) => ({ ...current, time: "" }));
                  }}
                  className={cn("field", errors.date && "field-error")}
                />
              </Field>
            </div>

            <div className="mt-5">
              <p className="field-label">Available time</p>
              {!form.date ? (
                <p className="text-[11.5px] text-stone">Choose a date to see available times.</p>
              ) : dateBlocked ? (
                <p className="border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] text-amber-800">
                  Our specialists are unavailable on this date. Please choose another day.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availability.slots.map((slot) => {
                    const taken = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={taken}
                        onClick={() => set("time", slot)}
                        aria-pressed={form.time === slot}
                        className={cn(
                          "flex items-center justify-center gap-1.5 border px-2 py-2.5 text-[11px] transition-colors",
                          taken
                            ? "cursor-not-allowed border-line bg-cream/60 text-stone/50 line-through"
                            : form.time === slot
                            ? "border-ink bg-ink text-ivory"
                            : "border-line bg-white text-charcoal hover:border-gold"
                        )}
                      >
                        <Clock size={11} /> {prettyTime(slot)}
                      </button>
                    );
                  })}
                </div>
              )}
              {errors.time && <p className="mt-2 text-[11px] text-red-500">{errors.time}</p>}
            </div>
          </section>

          <section className="mt-9 border-t border-line pt-8">
            <h2 className="font-serif text-2xl text-ink">3. Your details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="consult-name" label="Full name" error={errors.fullName}>
                <input
                  id="consult-name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  autoComplete="name"
                  className={cn("field", errors.fullName && "field-error")}
                />
              </Field>
              <Field id="consult-email" label="Email address" error={errors.email}>
                <input
                  id="consult-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  className={cn("field", errors.email && "field-error")}
                />
              </Field>
              <Field id="consult-mobile" label="Mobile number" error={errors.mobile}>
                <input
                  id="consult-mobile"
                  inputMode="numeric"
                  value={form.mobile}
                  onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  autoComplete="tel"
                  className={cn("field", errors.mobile && "field-error")}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="consult-notes" label="Additional questions (optional)">
                  <textarea
                    id="consult-notes"
                    rows={4}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Tell us about the occasion, budget or designs you have in mind."
                    className="field min-h-[110px] py-3"
                  />
                </Field>
              </div>
            </div>

            {errors.form && (
              <div role="alert" className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-[11.5px] text-red-700">
                {errors.form}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
              {submitting ? "Reserving…" : "Request consultation"} <ArrowRight size={14} />
            </button>
          </section>
        </form>

        <aside className="lg:sticky lg:top-[104px] lg:self-start">
          <div className="border border-line bg-white p-6">
            <Sparkles size={18} className="text-gold-dark" strokeWidth={1.5} />
            <h2 className="mt-3 font-serif text-xl text-ink">What to expect</h2>
            <ul className="mt-3 space-y-3 text-[12px] leading-relaxed text-charcoal/65">
              <li className="flex gap-2.5"><CalendarDays size={14} className="mt-0.5 shrink-0 text-gold-dark" /> A 30-minute appointment at your chosen time, subject to confirmation.</li>
              <li className="flex gap-2.5"><Video size={14} className="mt-0.5 shrink-0 text-gold-dark" /> A video meeting link added by our team once approved.</li>
              <li className="flex gap-2.5"><UserRound size={14} className="mt-0.5 shrink-0 text-gold-dark" /> One-to-one guidance on style, materials and occasions.</li>
            </ul>
            <div className="mt-5 border-t border-line pt-4 text-[11px] leading-relaxed text-stone">
              Your details are used only to manage this appointment. See our{" "}
              <Link to="/privacy-policy" className="text-gold-dark underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.16em] text-stone">{label}</dt>
      <dd className="mt-1 text-[12.5px] text-charcoal">{value}</dd>
    </div>
  );
}
