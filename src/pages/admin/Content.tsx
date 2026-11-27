import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Banner, SectionImageKey, StoreSettings } from "@/types";
import { AdminPageHeader, AdminTable, AdminField } from "@/components/admin/AdminUI";
import { ImageManager } from "@/components/admin/ImageManager";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCatalogue, makeId } from "@/context/CatalogueContext";

const SECTION_FIELDS: { key: SectionImageKey; label: string; hint: string }[] = [
  { key: "newArrivalsBanner", label: "New Arrivals banner", hint: "Head image for /new-arrivals" },
  { key: "bridalBanner", label: "Bridal banner", hint: "Head image for the Bridal collection page" },
  { key: "aboutHero", label: "About Us hero", hint: "Top of the About page" },
  { key: "aboutBrandStory", label: "About — brand story", hint: "Large story image" },
  { key: "aboutCraftsmanship", label: "About — craftsmanship", hint: "Secondary story image" },
  { key: "aboutLifestyle", label: "About — lifestyle", hint: "Optional editorial image" },
  { key: "contactBanner", label: "Contact banner", hint: "Top of the Contact page" },
];

const EMPTY_BANNER: Banner = {
  id: "",
  placement: "hero",
  title: "",
  subtitle: "",
  alt: "",
  image: "",
  href: "/collections/best-sellers",
  enabled: true,
};

export function AdminContent() {
  const {
    banners,
    settings,
    sectionImages,
    saveBanner,
    deleteBanner,
    updateSettings,
    updateSectionImage,
  } = useCatalogue();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [draft, setDraft] = useState<Banner>(EMPTY_BANNER);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [error, setError] = useState("");

  const [settingsDraft, setSettingsDraft] = useState<StoreSettings>(settings);
  const [saved, setSaved] = useState(false);

  const openAdd = () => {
    setEditingBanner(null);
    setDraft({ ...EMPTY_BANNER, id: makeId("banner") });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setDraft({ ...banner });
    setError("");
    setModalOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.title.trim().length < 2) {
      setError("Enter a banner title.");
      return;
    }
    if (!draft.image) {
      setError("Add a banner image.");
      return;
    }
    saveBanner({
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      alt: draft.alt.trim() || draft.title.trim(),
      href: draft.href.trim() || "/",
    });
    setModalOpen(false);
  };

  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settingsDraft,
      gstRate: Math.max(0, Number(settingsDraft.gstRate) || 0),
      shippingFee: Math.max(0, Number(settingsDraft.shippingFee) || 0),
      freeShippingThreshold: Math.max(
        0,
        Number(settingsDraft.freeShippingThreshold) || 0
      ),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const setSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setSettingsDraft((current) => ({ ...current, [key]: value }));

  return (
    <div>
      <AdminPageHeader
        title="Storefront content"
        description="Home banners, section imagery and the store details used across the site and legal pages."
        action={
          <Button size="sm" onClick={openAdd}>
            <Plus size={14} /> Add banner
          </Button>
        }
      />

      <AdminTable head={["Banner", "Placement", "Link", "Visible", "Actions"]}>
        {banners.map((banner) => (
          <tr key={banner.id} className="text-[11.5px]">
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <ProductImage src={banner.image} alt={banner.alt || banner.title} label={banner.title} className="h-11 w-16 shrink-0" />
                <div className="min-w-0">
                  <p className="max-w-[240px] truncate font-medium text-ink">{banner.title}</p>
                  <p className="max-w-[240px] truncate text-[9.5px] text-stone">{banner.subtitle}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 capitalize text-charcoal/65">{banner.placement}</td>
            <td className="px-4 py-3 text-[10px] text-stone">{banner.href}</td>
            <td className="px-4 py-3">
              <button
                onClick={() => saveBanner({ ...banner, enabled: !banner.enabled })}
                className={
                  banner.enabled
                    ? "border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-emerald-700"
                    : "border border-red-200 bg-red-50 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-red-600"
                }
              >
                {banner.enabled ? "Visible" : "Hidden"}
              </button>
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-1">
                <button onClick={() => openEdit(banner)} aria-label={`Edit ${banner.title}`} className="p-1.5 text-charcoal/60 hover:text-gold-dark">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(banner)} aria-label={`Delete ${banner.title}`} className="p-1.5 text-charcoal/60 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {banners.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-10 text-center text-[12px] text-stone">
              No banners yet. The storefront falls back to its built-in hero.
            </td>
          </tr>
        )}
      </AdminTable>

      <section className="mt-10">
        <div>
          <h2 className="font-serif text-xl text-ink">Section imagery</h2>
          <p className="mt-1 text-[11px] text-stone">
            Images used by New Arrivals, About Us and Contact. Home images are managed
            above as banners; replacing one here never alters the existing home files.
          </p>
        </div>
        <div className="mt-4 grid gap-4 border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="border border-line/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.15em] text-stone">{hint}</p>
              <div className="mt-2">
                <ImageManager
                  images={sectionImages[key] ? [sectionImages[key]] : []}
                  onChange={(images) => updateSectionImage(key, images[0] ?? "")}
                  single
                  label={label}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <form onSubmit={saveSettings} className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-ink">Store settings, customer support & website settings</h2>
            <p className="mt-1 text-[11px] text-stone">
              Announcements, contact details, social links, payment methods and shipping
              rules. Leave a field blank rather than inventing a value — placeholders stay
              visible until you fill them in.
            </p>
          </div>
          <Button type="submit" size="sm" variant="outline">
            {saved ? "Saved" : "Save settings"}
          </Button>
        </div>

        <div className="mt-4 grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
          <AdminField id="set-brand" label="Brand name" value={settingsDraft.brandName} onChange={(v) => setSetting("brandName", v)} />
          <AdminField id="set-tagline" label="Tagline" value={settingsDraft.tagline} onChange={(v) => setSetting("tagline", v)} />
          <AdminField id="set-announcement" label="Announcement bar — message 1" value={settingsDraft.announcement} onChange={(v) => setSetting("announcement", v)} className="sm:col-span-2" />
          <AdminField id="set-shipping-msg" label="Announcement bar — message 2 (shipping)" value={settingsDraft.shippingMessage} onChange={(v) => setSetting("shippingMessage", v)} className="sm:col-span-2" />
          <AdminField id="set-care-msg" label="Announcement bar — message 3 (customer care)" value={settingsDraft.careMessage} onChange={(v) => setSetting("careMessage", v)} className="sm:col-span-2" />
          <AdminField id="set-email" label="Support email" value={settingsDraft.supportEmail} onChange={(v) => setSetting("supportEmail", v)} />
          <AdminField id="set-phone" label="Support phone" value={settingsDraft.supportPhone} onChange={(v) => setSetting("supportPhone", v)} />
          <AdminField id="set-whatsapp" label="WhatsApp business number" value={settingsDraft.whatsapp} onChange={(v) => setSetting("whatsapp", v)} placeholder="919876543210" />
          <p className="sm:col-span-2 -mt-2 text-[10px] leading-relaxed text-stone">
            Use the real business number in international format, digits only (country code +
            number, no + or spaces). The floating WhatsApp button and footer link appear only
            after a number is saved — no number is invented for you.
          </p>
          <AdminField id="set-support-msg" label="Customer support message" value={settingsDraft.supportMessage} onChange={(v) => setSetting("supportMessage", v)} className="sm:col-span-2" />
          <AdminField id="set-instagram" label="Instagram URL" value={settingsDraft.instagram} onChange={(v) => setSetting("instagram", v)} />
          <AdminField id="set-facebook" label="Facebook URL" value={settingsDraft.facebook} onChange={(v) => setSetting("facebook", v)} />
          <AdminField id="set-youtube" label="YouTube URL" value={settingsDraft.youtube} onChange={(v) => setSetting("youtube", v)} />
          <AdminField id="set-payments" label="Enabled payment methods (comma separated)" value={settingsDraft.paymentMethods} onChange={(v) => setSetting("paymentMethods", v)} className="sm:col-span-2" />
          <AdminField id="set-address" label="Business address" value={settingsDraft.businessAddress} onChange={(v) => setSetting("businessAddress", v)} className="sm:col-span-2" />
          <AdminField id="set-gstin" label="GSTIN" value={settingsDraft.gstin} onChange={(v) => setSetting("gstin", v)} />
          <AdminField id="set-free-shipping" label="Free shipping above (₹)" value={String(settingsDraft.freeShippingThreshold)} onChange={(v) => setSetting("freeShippingThreshold", Number(v.replace(/\D/g, "")))} />
          <AdminField id="set-shipping-fee" label="Shipping fee (₹)" value={String(settingsDraft.shippingFee)} onChange={(v) => setSetting("shippingFee", Number(v.replace(/\D/g, "")))} />
          <AdminField id="set-gst" label="GST rate (fraction, 0.03 = 3%)" value={String(settingsDraft.gstRate)} onChange={(v) => setSetting("gstRate", Number(v.replace(/[^0-9.]/g, "")))} placeholder="0.03" />
        </div>
      </form>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBanner ? "Edit banner" : "Add banner"} panelClassName="sm:max-w-lg">
        <form onSubmit={save} className="space-y-4 p-6">
          <AdminField id="banner-title" label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} required />
          <AdminField id="banner-subtitle" label="Subtitle" value={draft.subtitle} onChange={(v) => setDraft({ ...draft, subtitle: v })} />
          <div>
            <label htmlFor="banner-placement" className="field-label">Placement</label>
            <select
              id="banner-placement"
              value={draft.placement}
              onChange={(e) => setDraft({ ...draft, placement: e.target.value as Banner["placement"] })}
              className="field h-11 text-[12.5px]"
            >
              <option value="hero">Hero (homepage top)</option>
              <option value="editorial">Editorial</option>
              <option value="promo">Promo strip</option>
            </select>
          </div>
          <AdminField id="banner-href" label="Link" value={draft.href} onChange={(v) => setDraft({ ...draft, href: v })} placeholder="/collections/best-sellers" />
          <AdminField id="banner-alt" label="Alt text" value={draft.alt} onChange={(v) => setDraft({ ...draft, alt: v })} placeholder="Describe the image" />
          <ImageManager
            images={draft.image ? [draft.image] : []}
            onChange={(images) => setDraft({ ...draft, image: images[0] ?? "" })}
            single
            label="Banner image"
          />
          <label className="flex cursor-pointer items-center gap-2 text-[11.5px] text-charcoal/75">
            <input
              type="checkbox"
              checked={draft.enabled}
              onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
              className="h-3.5 w-3.5 accent-[#C6A15B]"
            />
            Show on storefront
          </label>
          {error && <p className="text-[10.5px] text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="submit" className="flex-1">Save banner</Button>
            <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete banner" panelClassName="sm:max-w-md">
        <div className="p-6">
          <p className="text-[13px] leading-relaxed text-charcoal/70">
            Delete <strong className="text-ink">{deleting?.title}</strong>? The image stays
            in the media library.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleting) deleteBanner(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setDeleting(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
