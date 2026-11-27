import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { isValidEmail } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { newsletterService } from "@/services/newsletterService";
import { isApiConfigured } from "@/services/apiClient";

export function NewsletterForm({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const fieldId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setStatus("loading");
    try {
      await newsletterService.subscribe(email);
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Unable to subscribe right now.");
    }
  };

  if (status === "done") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 border p-4",
          variant === "dark" ? "border-ivory/15 bg-white/5" : "border-line bg-white",
          className
        )}
        role="status"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
          <Check size={13} strokeWidth={2.5} />
        </span>
        <div>
          <p className={cn("text-sm", variant === "dark" ? "text-ivory" : "text-ink")}>
            Thank you — you're on the list.
          </p>
          <p
            className={cn(
              "mt-1 text-[11px] leading-relaxed",
              variant === "dark" ? "text-ivory/45" : "text-stone"
            )}
          >
            {isApiConfigured()
              ? "Please confirm the subscription from the email we send you."
              : "Demo build: this address is stored in this browser only. It is not a mailing list until an email provider and double opt-in are configured."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={className}>
      <div
        className={cn(
          "flex items-center border-b",
          variant === "dark" ? "border-ivory/25" : "border-ink/25"
        )}
      >
        <label htmlFor={fieldId} className="sr-only">
          Email address
        </label>
        <input
          id={fieldId}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter your email address"
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full bg-transparent py-3.5 text-sm outline-none",
            variant === "dark"
              ? "text-ivory placeholder:text-ivory/35"
              : "text-ink placeholder:text-stone/60"
          )}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          aria-label="Subscribe"
          className={cn(
            "flex shrink-0 items-center gap-2 px-2 py-3 text-[10px] uppercase tracking-[0.2em] transition-colors disabled:opacity-50",
            variant === "dark" ? "text-gold hover:text-gold-light" : "text-gold-dark hover:text-ink"
          )}
        >
          {status === "loading" ? "Joining…" : "Subscribe"}
          {status !== "loading" && <ArrowRight size={14} />}
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
    </form>
  );
}
