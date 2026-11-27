import { useEffect, useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField } from "@/components/ui/PasswordField";
import { DemoNote } from "@/components/ui/DemoNote";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { cn, isValidEmail, isValidIndianMobile } from "@/lib/utils";

const REGISTER_IMAGE =
  "/images/bridal-white.jpg";

interface FormState {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

export function Register() {
  const { register, user, isDemo } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Create Account — LEO JEWELS";
  }, []);

  if (user) return <Navigate to="/account" replace />;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (form.fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
    if (!isValidIndianMobile(form.mobile))
      next.mobile = "Enter a valid 10-digit Indian mobile number.";
    if (form.password.length < 8)
      next.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "Include at least one letter and one number.";
    if (form.password !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match.";
    if (!form.terms) next.terms = "Please accept the terms and privacy policy.";
    return next;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        password: form.password,
      });
      notify("Your LEO JEWELS account is ready.");
      navigate("/account", { replace: true });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Unable to create account." });
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/\d/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  })();

  return (
    <AuthLayout
      eyebrow="Join The House"
      title="Create your account"
      subtitle="Save your favourite pieces, track orders and enjoy a faster checkout."
      image={REGISTER_IMAGE}
      imageAlt="Bridal jewellery detail"
      footer={
        <p className="text-center text-[12px] text-charcoal/60">
          Already have an account?{" "}
          <Link to="/login" className="text-gold-dark underline underline-offset-4 hover:text-ink">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {errors.form && (
          <div role="alert" className="border border-red-200 bg-red-50 px-3.5 py-3 text-[11.5px] leading-relaxed text-red-700">
            {errors.form}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="field-label">Full name</label>
          <input
            id="fullName"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            className={cn("field", errors.fullName && "field-error")}
          />
          {errors.fullName && <p className="mt-1.5 text-[11px] text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="field-label">Email address</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            className={cn("field", errors.email && "field-error")}
          />
          {errors.email && <p className="mt-1.5 text-[11px] text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="mobile" className="field-label">Mobile number</label>
          <div className="flex">
            <span className="flex h-12 items-center border border-r-0 border-line bg-cream px-3 text-[12px] text-charcoal/60">
              +91
            </span>
            <input
              id="mobile"
              type="tel"
              inputMode="numeric"
              value={form.mobile}
              onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              autoComplete="tel-national"
              aria-invalid={Boolean(errors.mobile)}
              className={cn("field", errors.mobile && "field-error")}
            />
          </div>
          {errors.mobile && <p className="mt-1.5 text-[11px] text-red-500">{errors.mobile}</p>}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={form.password}
          onChange={(value) => setField("password", value)}
          error={errors.password}
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
        />
        {form.password && (
          <div className="flex gap-1" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  strength >= i ? "bg-gold" : "bg-line"
                )}
              />
            ))}
          </div>
        )}

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={(value) => setField("confirmPassword", value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[11.5px] leading-relaxed text-charcoal/70">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => setField("terms", e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#C6A15B]"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="text-gold-dark underline underline-offset-2">Terms & Conditions</Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-gold-dark underline underline-offset-2">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && <p className="mt-1.5 text-[11px] text-red-500">{errors.terms}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create Account"}
          {!loading && <ArrowRight size={15} />}
        </button>

        {isDemo && (
          <DemoNote>
            <strong className="font-medium">Demo mode.</strong> No backend is connected;
            this account lives only in your browser. Do not use a real password.
          </DemoNote>
        )}

        <p className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-stone">
          <Check size={12} className="text-gold-dark" /> Secure forms · No data leaves this browser in demo mode
        </p>
      </form>
    </AuthLayout>
  );
}
