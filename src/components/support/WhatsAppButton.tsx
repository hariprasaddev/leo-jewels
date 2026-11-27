import { useLocation } from "react-router-dom";
import { useCatalogue } from "@/context/CatalogueContext";

/** Official WhatsApp glyph (brand asset path, not an emoji). */
export function WhatsAppIcon({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function contextualMessage(pathname: string, productName?: string): string {
  if (pathname.startsWith("/product/")) {
    return `Hello LEO JEWELS, I am interested in this product: ${
      productName ?? "the piece I am viewing"
    }. Please share more details.`;
  }
  if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) {
    return "Hello LEO JEWELS, I need assistance with my shopping cart.";
  }
  if (pathname.startsWith("/order-tracking") || pathname.startsWith("/track-order")) {
    return "Hello LEO JEWELS, I need help tracking my order.";
  }
  if (pathname.startsWith("/book-consultation")) {
    return "Hello LEO JEWELS, I would like to book a live video jewellery consultation.";
  }
  if (pathname.startsWith("/bridal") || pathname.startsWith("/collections/bridal")) {
    return "Hello LEO JEWELS, I would like to know more about your bridal jewellery collection.";
  }
  if (pathname.startsWith("/new-arrivals")) {
    return "Hello LEO JEWELS, I would like to know more about your new arrivals.";
  }
  if (pathname.startsWith("/contact")) {
    return "Hello LEO JEWELS, I would like to speak with customer care.";
  }
  return "Hello LEO JEWELS, I would like to know more about your jewellery collections.";
}

/**
 * Global WhatsApp support link, mounted once in the storefront layout.
 *
 * The number is read from Admin → Storefront content (StoreSettings.whatsapp)
 * and must be the real business number in international format. When it is not
 * configured the control is not rendered, so customers are never sent to an
 * invented or dead number.
 */
export function WhatsAppButton() {
  const { pathname } = useLocation();
  const { settings, getProductBySlug } = useCatalogue();

  const digits = settings.whatsapp.replace(/\D/g, "");
  if (!digits) return null;

  const slug = pathname.startsWith("/product/") ? pathname.split("/")[2] : undefined;
  const product = slug ? getProductBySlug(slug) : undefined;
  const message = contextualMessage(pathname, product?.name);
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with LEO JEWELS on WhatsApp"
      title="Chat with us"
      className="group fixed bottom-5 right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#128C7E] text-white shadow-[0_10px_30px_-8px_rgba(18,140,126,0.6)] transition-all duration-300 hover:scale-105 hover:bg-[#0f7a6d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:bottom-6 sm:right-6"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <WhatsAppIcon size={27} />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap bg-ink px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ivory opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block">
        Chat with us
      </span>
    </a>
  );
}
