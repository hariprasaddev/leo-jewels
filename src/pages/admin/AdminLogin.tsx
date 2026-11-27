import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { DemoNote } from "@/components/ui/DemoNote";
import {
  createFirstAdmin,
  hasAdminAccounts,
  signInAdmin,
} from "@/lib/adminAuth";
import { cn } from "@/lib/utils";

export function AdminLogin() {
  const navigate = useNavigate();
  const [setupMode, setSetupMode] = useState(() => !hasAdminAccounts());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Admin — LEO JEWELS";
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter both email and password.");
      return;
    }
    if (setupMode && !name.trim()) {
      setError("Enter the administrator's name.");
      return;
    }
    if (setupMode && password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      if (setupMode) {
        await createFirstAdmin({ name, email, password });
      } else {
        await signInAdmin(email, password);
      }
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Sign in could not be completed."
      );
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-ivory lg:grid-cols-[1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 bg-[radial-gradient(circle,rgba(198,161,91,0.22),transparent_70%)]" />
        <Logo variant="dark" size="md" to="/" />
        <div className="relative">
          <p className="eyebrow text-gold">LEO JEWELS Admin</p>
          <h1 className="mt-4 max-w-sm font-serif text-4xl leading-tight text-ivory">
            A considered view of the store.
          </h1>
          <p className="mt-4 max-w-sm text-[12.5px] leading-relaxed text-ivory/45">
            Products, inventory, imagery and store content. Administrator accounts are
            created privately on first use — there is no default login.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/25">
          Restricted area · Local demonstration build
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <Logo size="sm" withTagline={false} />
          <Link to="/" className="text-[9.5px] uppercase tracking-[0.16em] text-stone">Storefront</Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <div className="w-full max-w-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold-dark">
              {setupMode ? <ShieldCheck size={18} strokeWidth={1.5} /> : <Lock size={18} strokeWidth={1.5} />}
            </span>
            <h1 className="mt-5 font-serif text-3xl text-ink">
              {setupMode ? "Create the owner account" : "Admin sign in"}
            </h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-charcoal/55">
              {setupMode
                ? "No administrator exists in this browser yet. Create the first account now. Choose a password you do not use elsewhere."
                : "Sign in with an administrator account created for this browser."}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              {error && (
                <div role="alert" className="border border-red-200 bg-red-50 px-3.5 py-3 text-[11.5px] text-red-700">
                  {error}
                </div>
              )}
              {setupMode && (
                <div>
                  <label htmlFor="admin-name" className="field-label">Your name</label>
                  <input
                    id="admin-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    placeholder="Store owner"
                    autoComplete="name"
                    className="field"
                  />
                </div>
              )}
              <div>
                <label htmlFor="admin-email" className="field-label">Admin email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@yourstore.com"
                  autoComplete="username"
                  className={cn("field", error && "field-error")}
                />
              </div>
              <div>
                <label htmlFor="admin-password" className="field-label">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder={setupMode ? "At least 8 characters" : "••••••••"}
                  autoComplete={setupMode ? "new-password" : "current-password"}
                  className="field"
                />
              </div>
              {setupMode && (
                <div>
                  <label htmlFor="admin-confirm" className="field-label">Confirm password</label>
                  <input
                    id="admin-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    className="field"
                  />
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading
                  ? setupMode
                    ? "Creating account…"
                    : "Signing in…"
                  : setupMode
                    ? "Create administrator"
                    : "Enter admin portal"}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            {setupMode && hasAdminAccounts() && (
              <button
                onClick={() => setSetupMode(false)}
                className="mt-5 text-[10px] uppercase tracking-[0.15em] text-gold-dark"
              >
                An account already exists — sign in
              </button>
            )}

            <DemoNote className="mt-5">
              This admin area is a browser-local demonstration. Credentials are hashed and
              stored only in this browser; they are not sent to a server and do not protect
              a real database. Production requires the Spring Boot API with Spring Security,
              server-side roles and protected admin endpoints. See ADMIN_SETUP.md.
            </DemoNote>

            <Link to="/" className="mt-6 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-charcoal/55 hover:text-ink">
              ← Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
