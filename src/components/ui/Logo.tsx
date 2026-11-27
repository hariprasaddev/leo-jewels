import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BRAND } from "@/data/brandAssets";

/**
 * Brand artwork is optional until it is uploaded. Sources that failed once are
 * remembered so the rest of the page (and later navigation) uses the text
 * lockup immediately instead of retrying a missing file on every mount.
 */
const failedLogoSources = new Set<string>();

const RAYS = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 24 - Math.PI / 2;
  const inner = 25.4;
  const outer = i % 2 === 0 ? 30 : 28.2;
  return {
    x1: 32 + Math.cos(angle) * inner,
    y1: 32 + Math.sin(angle) * inner,
    x2: 32 + Math.cos(angle) * outer,
    y2: 32 + Math.sin(angle) * outer,
    opacity: i % 2 === 0 ? 0.9 : 0.45,
  };
});

export function LionEmblem({
  className,
  title = "LEO JEWELS lion emblem",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("block", className)}
      fill="none"
      stroke="currentColor"
    >
      <g strokeWidth="0.9" strokeLinecap="round">
        {RAYS.map((ray, i) => (
          <line
            key={i}
            x1={ray.x1}
            y1={ray.y1}
            x2={ray.x2}
            y2={ray.y2}
            opacity={ray.opacity}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="23.4" strokeWidth="0.9" opacity="0.55" />
      <path
        d="M32 17.6 L43.4 24.6 V35.4 C43.4 43.2 38 48.8 32 51.4 C26 48.8 20.6 43.2 20.6 35.4 V24.6 Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24.4 24.2 L27.9 19.4 L32 22.4 L36.1 19.4 L39.6 24.2"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M25.4 33.4 L29.1 34.9 L25.4 36.4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38.6 33.4 L34.9 34.9 L38.6 36.4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 37.4 L34.1 39.9 L32 41.4 L29.9 39.9 Z" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M32 41.4 V44.2 M32 44.2 L28.7 46.6 M32 44.2 L35.3 46.6" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M21.8 30.2 C19.2 31.6 18.3 34.4 19.4 36.6" strokeWidth="0.9" opacity="0.6" />
      <path d="M42.2 30.2 C44.8 31.6 45.7 34.4 44.6 36.6" strokeWidth="0.9" opacity="0.6" />
    </svg>
  );
}

/**
 * Brand lockup.
 *
 * Reads the approved artwork from `public/images/branding/logo/` (see
 * `src/data/brandAssets.ts`). The image keeps its natural aspect ratio with
 * `object-contain` and a max height per size. If no file is present — or it
 * fails to load — the original text lockup renders instead, never a broken image.
 */
export function Logo({
  variant = "light",
  size = "md",
  withTagline = true,
  to = "/",
  onClick,
}: {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  withTagline?: boolean;
  to?: string;
  onClick?: () => void;
}) {
  const isDark = variant === "dark";
  const dimensions = {
    sm: { emblem: "h-9 w-9", name: "text-[19px]", tag: "text-[7.5px]", gap: "gap-2.5" },
    md: { emblem: "h-11 w-11", name: "text-[24px]", tag: "text-[8.5px]", gap: "gap-3" },
    lg: { emblem: "h-16 w-16", name: "text-[34px]", tag: "text-[10px]", gap: "gap-4" },
  }[size];

  const [failedCount, setFailedCount] = useState(
    () => BRAND.logo.sources.filter((source) => failedLogoSources.has(source)).length
  );
  const logoSrc = BRAND.logo.sources[failedCount] ?? null;

  const handleLogoError = () => {
    if (!logoSrc) return;
    failedLogoSources.add(logoSrc);
    setFailedCount((count) => count + 1);
  };

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={`${BRAND.name} — home`}
      className="group inline-flex max-w-full items-center"
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={BRAND.logo.alt}
          decoding="async"
          onError={handleLogoError}
          className="block w-auto max-w-[260px] object-contain"
          style={{
            height: BRAND.logo.maxHeight[size],
            maxHeight: BRAND.logo.maxHeight[size],
          }}
        />
      ) : (
        <span className={cn("inline-flex items-center", dimensions.gap)}>
          <LionEmblem
            className={cn(
              dimensions.emblem,
              "shrink-0 text-gold transition-transform duration-500 ease-silk group-hover:rotate-[8deg]"
            )}
          />
          <span className={cn("flex-col", size === "sm" ? "hidden min-[380px]:flex" : "flex")}>
            <span
              className={cn(
                "whitespace-nowrap font-serif uppercase leading-none tracking-[0.18em]",
                dimensions.name,
                isDark ? "text-warm-ivory" : "text-ink"
              )}
            >
              Leo <span className={isDark ? "text-champagne" : "text-gold-dark"}>Jewels</span>
            </span>
            {withTagline && (
              <span
                className={cn(
                  "mt-1.5 whitespace-nowrap font-sans uppercase leading-none tracking-[0.3em]",
                  dimensions.tag,
                  isDark ? "text-warm-ivory/45" : "text-stone"
                )}
              >
                {BRAND.tagline}
              </span>
            )}
          </span>
        </span>
      )}
    </Link>
  );
}
