import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { PolicyKind, PolicyPage, PolicySection } from "@/types";
import { AdminPageHeader, AdminField } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/Button";
import { useCatalogue } from "@/context/CatalogueContext";

interface SectionDraft {
  heading: string;
  body: string;
  list: string;
}

function toDraft(page: PolicyPage) {
  return {
    title: page.title,
    eyebrow: page.eyebrow,
    description: page.description,
    updated: page.updated,
    sections: page.sections.map<SectionDraft>((section) => ({
      heading: section.heading,
      body: section.body.join("\n\n"),
      list: section.list?.join("\n") ?? "",
    })),
  };
}

export function AdminPolicies() {
  const { policies, updatePolicy } = useCatalogue();
  const [selected, setSelected] = useState<PolicyKind>(
    policies[0]?.kind ?? "shipping"
  );
  const page = policies.find((p) => p.kind === selected) ?? policies[0];
  const [draft, setDraft] = useState(() => (page ? toDraft(page) : null));
  const [saved, setSaved] = useState(false);

  const activePage = useMemo(
    () => policies.find((p) => p.kind === selected) ?? policies[0],
    [policies, selected]
  );

  const select = (kind: PolicyKind) => {
    const next = policies.find((p) => p.kind === kind);
    if (!next) return;
    setSelected(kind);
    setDraft(toDraft(next));
    setSaved(false);
  };

  const setSection = (index: number, patch: Partial<SectionDraft>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      sections: draft.sections.map((section, i) =>
        i === index ? { ...section, ...patch } : section
      ),
    });
  };

  const addSection = () => {
    if (!draft) return;
    setDraft({
      ...draft,
      sections: [...draft.sections, { heading: "", body: "", list: "" }],
    });
  };

  const removeSection = (index: number) => {
    if (!draft) return;
    setDraft({ ...draft, sections: draft.sections.filter((_, i) => i !== index) });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePage || !draft) return;
    const sections: PolicySection[] = draft.sections
      .map((section) => ({
        heading: section.heading.trim(),
        body: section.body
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean),
        list: section.list
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      }))
      .filter((section) => section.heading && section.body.length)
      .map((section) => (section.list && section.list.length ? section : { ...section, list: undefined }));

    updatePolicy(activePage.kind, {
      ...activePage,
      title: draft.title.trim(),
      eyebrow: draft.eyebrow.trim(),
      description: draft.description.trim(),
      updated: draft.updated.trim(),
      sections,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  if (!draft || !activePage) {
    return (
      <div>
        <AdminPageHeader title="Policies" description="No policy pages found." />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Policies & legal content"
        description="Edit the pages linked in the storefront footer. Placeholders in curly braces are replaced with your store settings."
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {policies.map((policy) => (
          <button
            key={policy.kind}
            onClick={() => select(policy.kind)}
            className={
              policy.kind === selected
                ? "border border-gold bg-gold/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-ink"
                : "border border-line bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-charcoal/60 hover:border-gold/60"
            }
          >
            {policy.title}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 border border-line bg-white p-5 sm:grid-cols-2">
          <AdminField id="pol-title" label="Page title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
          <AdminField id="pol-eyebrow" label="Eyebrow" value={draft.eyebrow} onChange={(v) => setDraft({ ...draft, eyebrow: v })} />
          <AdminField id="pol-updated" label="Last updated" value={draft.updated} onChange={(v) => setDraft({ ...draft, updated: v })} placeholder="24 November 2026" />
          <div className="sm:col-span-2">
            <label htmlFor="pol-description" className="field-label">Intro description</label>
            <textarea
              id="pol-description"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="field h-auto resize-none py-2.5 text-[12.5px]"
            />
          </div>
        </div>

        <div className="space-y-3">
          {draft.sections.map((section, index) => (
            <div key={index} className="border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[9px] uppercase tracking-[0.18em] text-stone">
                  Section {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  aria-label="Remove section"
                  className="p-1 text-charcoal/50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-3 space-y-3">
                <AdminField id={`sec-heading-${index}`} label="Heading" value={section.heading} onChange={(v) => setSection(index, { heading: v })} />
                <div>
                  <label htmlFor={`sec-body-${index}`} className="field-label">
                    Body (blank line between paragraphs)
                  </label>
                  <textarea
                    id={`sec-body-${index}`}
                    rows={4}
                    value={section.body}
                    onChange={(e) => setSection(index, { body: e.target.value })}
                    className="field h-auto resize-y py-2.5 text-[12.5px]"
                  />
                </div>
                <div>
                  <label htmlFor={`sec-list-${index}`} className="field-label">
                    Bullet list (optional, one per line)
                  </label>
                  <textarea
                    id={`sec-list-${index}`}
                    rows={3}
                    value={section.list}
                    onChange={(e) => setSection(index, { list: e.target.value })}
                    className="field h-auto resize-y py-2.5 text-[12.5px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" size="sm" onClick={addSection}>
            <Plus size={14} /> Add section
          </Button>
          <Button type="submit" size="sm">
            {saved ? "Saved" : "Save page"}
          </Button>
        </div>
        <p className="text-[10px] leading-relaxed text-stone">
          Nothing here is legal advice. Confirm every policy, including return
          windows and registered business details, with your own advisors before
          relying on it.
        </p>
      </form>
    </div>
  );
}
