import { Link } from "react-router-dom";
import { ArrowRight, Gem, Heart, Leaf, Users } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ProductImage } from "@/components/ui/ProductImage";
import { Logo } from "@/components/ui/Logo";
import { useCatalogue } from "@/context/CatalogueContext";

export function About() {
  const { sectionImages } = useCatalogue();
  return (
    <div>
      <PageHero
        eyebrow="The House of LEO"
        title="Beauty in Every Detail"
        description="A modern Indian jewellery house built on the belief that elegance should feel personal, not performative."
        crumbs={[{ label: "Home", to: "/" }, { label: "About Us" }]}
        image={sectionImages.aboutHero}
      />

      <section className="container-lux py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">
              Jewellery that becomes part of your story.
            </h2>
          </div>
          <div className="space-y-5 text-[14px] leading-[1.9] text-charcoal/65">
            <p>
              LEO JEWELS began with a simple observation: the jewellery people treasure
              most is rarely the most elaborate. It's the piece worn to a first
              celebration, the bangle passed down quietly, the earrings that make an
              ordinary day feel considered.
            </p>
            <p>
              We built our collections around that idea. Gold, silver, diamond, bridal and
              imitation jewellery are chosen for proportion, finish and comfort — pieces
              that look beautiful in person, not only in photographs.
            </p>
            <p>
              Our name takes inspiration from the lion: quiet confidence, strength and
              warmth. It shapes how we design, how we describe our pieces, and how we
              treat the people who wear them.
            </p>
          </div>
        </div>
      </section>

      <section className="container-lux pb-14 lg:pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <ProductImage
              src={sectionImages.aboutBrandStory}
              alt="The LEO JEWELS brand story"
              label="Our story"
              className="aspect-[16/10] w-full"
            />
            <p className="mt-3 text-[10.5px] text-stone">
              Considered design, from the first sketch to the finished piece.
            </p>
          </div>
          <div>
            <ProductImage
              src={sectionImages.aboutCraftsmanship}
              alt="Jewellery craftsmanship at LEO JEWELS"
              label="Craftsmanship"
              className="aspect-[4/5] w-full sm:aspect-[16/10]"
            />
            <p className="mt-3 text-[10.5px] text-stone">
              Finishing, setting and polishing — the details that make a piece last.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="container-lux py-14 lg:py-20">
          <div className="mx-auto max-w-xl text-center">
            <p className="eyebrow">What Guides Us</p>
            <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">Our Commitments</h2>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Gem,
                title: "Considered Design",
                copy: "Every silhouette is chosen for balance and wearability — pieces you reach for repeatedly, not once.",
              },
              {
                icon: Heart,
                title: "Customer First",
                copy: "Clear product information, responsive support and a straightforward returns process.",
              },
              {
                icon: Leaf,
                title: "Thoughtful Materials",
                copy: "Material details are stated plainly on each product page. We avoid vague claims about purity or origin.",
              },
              {
                icon: Users,
                title: "Made for Real Life",
                copy: "From everyday studs to bridal sets, our edit spans the moments that make up a life.",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 text-gold-dark">
                  <Icon size={19} strokeWidth={1.4} />
                </span>
                <h3 className="mt-4 font-serif text-xl text-ink">{title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-charcoal/60">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lux py-16 text-center lg:py-20">
        <Logo size="lg" withTagline />
        <p className="mx-auto mt-6 max-w-lg text-[13px] leading-relaxed text-charcoal/60">
          This is a demonstration storefront. Brand narrative, product catalogue and
          imagery are illustrative; certifications, hallmarking and business credentials
          are not claimed.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/collections/best-sellers" className="btn-primary">
            Explore the collections <ArrowRight size={14} />
          </Link>
          <Link to="/contact" className="btn-outline">Contact our team</Link>
        </div>
      </section>
    </div>
  );
}
