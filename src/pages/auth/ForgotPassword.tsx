import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DemoNote } from "@/components/ui/DemoNote";
import { authService } from "@/services/authService";
import { cn, isValidEmail, isValidIndianMobile } from "@/lib/utils";

const RESET_IMAGE =
  "/images/earrings-drop.jpg";

export function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Reset Password — LEO JEWELS";
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(identifier) && !isValidIndianMobile(identifier)) {
      setError("Enter the email address or mobile number linked to your account.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authService.requestPasswordReset(identifier.trim());
      setSentMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request a reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account Recovery"
      title="Forgot your password?"
      subtitle="Enter your registered email or mobile number and we'll help you get back in."
      image={RESET_IMAGE}
      imageAlt="Jewellery flat lay"
      footer={
        <p className="text-center text-[12px] text-charcoal/60">
          Remembered it?{" "}
          <Link to="/login" className="text-gold-dark underline underline-offset-4 hover:text-ink">
            Back to sign in
          </Link>
        </p>
      }
    >
      {sentMessage ? (
        <div className="space-y-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <Check size={24} className="text-gold-dark" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-ink">Request received</h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-charcoal/65">{sentMessage}</p>
          </div>
          <DemoNote>
            Password reset requires a configured backend and email provider. This screen
            demonstrates the flow only; no email has been sent.
          </DemoNote>
          <Link to="/login" className="btn-outline w-full">
            <ArrowLeft size={14} /> Return to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="flex items-center gap-3 border border-line bg-white px-3.5 py-3">
            <Mail size={16} className="shrink-0 text-gold-dark" />
            <p className="text-[11px] leading-relaxed text-charcoal/60">
              For security, we don't reveal whether an account exists.
            </p>
          </div>
          <div>
            <label htmlFor="identifier" className="field-label">
              Email or mobile number
            </label>
            <input
              id="identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError("");
              }}
              placeholder="you@example.com or 98765 43210"
              autoComplete="username"
              aria-invalid={Boolean(error)}
              className={cn("field", error && "field-error")}
            />
            {error && <p className="mt-1.5 text-[11px] text-red-500">{error}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending request…" : "Send reset link"}
          </button>
          <DemoNote>
            <strong className="font-medium">Demo mode.</strong> No reset email can be
            sent until VITE_API_BASE_URL points to the Spring Boot API.
          </DemoNote>
        </form>
      )}
    </AuthLayout>
  );
}
