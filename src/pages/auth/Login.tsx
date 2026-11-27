import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordField } from "@/components/ui/PasswordField";
import { DemoNote } from "@/components/ui/DemoNote";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { isValidEmail, isValidIndianMobile, cn } from "@/lib/utils";

const LOGIN_IMAGE =
  "/images/necklace-aurelia.jpg";

export function Login() {
  const { login, user, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/account";

  useEffect(() => {
    document.title = "Sign In — LEO JEWELS";
  }, []);

  if (user) return <Navigate to="/account" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!identifier.trim()) next.identifier = "Enter your email address or mobile number.";
    else if (!isValidEmail(identifier) && !isValidIndianMobile(identifier))
      next.identifier = "Enter a valid email address or 10-digit mobile number.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(identifier.trim(), password, remember);
      notify("Welcome back to LEO JEWELS.");
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Unable to sign in." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome Back"
      title="Sign in to your account"
      subtitle="View your orders, saved pieces and addresses, all in one place."
      image={LOGIN_IMAGE}
      imageAlt="Gold jewellery on a display stand"
      footer={
        <p className="text-center text-[12px] text-charcoal/60">
          New to LEO JEWELS?{" "}
          <Link to="/register" className="text-gold-dark underline underline-offset-4 hover:text-ink">
            Create an account
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
          <label htmlFor="identifier" className="field-label">
            Email or mobile number
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setErrors((c) => ({ ...c, identifier: undefined, form: undefined }));
            }}
            placeholder="you@example.com or 98765 43210"
            autoComplete="username"
            aria-invalid={Boolean(errors.identifier)}
            className={cn("field", errors.identifier && "field-error")}
          />
          {errors.identifier && <p className="mt-1.5 text-[11px] text-red-500">{errors.identifier}</p>}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setErrors((c) => ({ ...c, password: undefined, form: undefined }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-charcoal/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#C6A15B]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[11.5px] text-gold-dark hover:text-ink">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign In"}
          {!loading && <ArrowRight size={15} />}
        </button>

        {isDemo && (
          <DemoNote>
            <strong className="font-medium">Demo mode.</strong> Authentication is not
            connected to a server. Accounts created here are stored in this browser only
            and are not secure — configure <code className="text-[10px]">VITE_API_BASE_URL</code> for
            real JWT authentication.
          </DemoNote>
        )}
      </form>
    </AuthLayout>
  );
}
