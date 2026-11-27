import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useCatalogue } from "@/context/CatalogueContext";

export function AnnouncementBar() {
  const { settings } = useCatalogue();
  const messages = useMemo(
    () =>
      [settings.announcement, settings.shippingMessage, settings.careMessage].filter(
        (message) => message && message.trim().length > 0
      ),
    [settings.announcement, settings.shippingMessage, settings.careMessage]
  );
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed || messages.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % messages.length),
      6000
    );
    return () => window.clearInterval(timer);
  }, [dismissed, messages.length]);

  if (dismissed || messages.length === 0) return null;

  return (
    <div className="relative bg-charcoal-deep text-warm-ivory">
      <div className="container-lux flex h-9 items-center justify-center px-8">
        <p key={index} className="animate-fade-in text-center text-[9.5px] uppercase tracking-[0.22em] text-warm-ivory/80 sm:text-[10px]">
          {messages[index % messages.length]}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-warm-ivory/45 transition-colors hover:text-champagne"
      >
        <X size={13} />
      </button>
    </div>
  );
}
