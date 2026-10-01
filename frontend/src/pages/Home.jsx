import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sun, Battery, Zap, Grid3x3, Power, Combine, ArrowRight, Phone, MessageCircle,
  CheckCircle2, ShieldCheck, Wrench, PiggyBank, Headset, PanelTop, Star, Quote as QuoteIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/public/SectionHeading";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import SolarCalculator from "@/components/public/SolarCalculator";
import EmiCalculator from "@/components/public/EmiCalculator";
import { usePublicContent } from "@/lib/hooks";
import { useSettings } from "@/context/SettingsContext";
import { mediaUrl } from "@/lib/api";
import { waLink, telLink } from "@/lib/constants";

const CONTAINER = "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl";

const CATEGORIES = [
  { name: "Solar Panel", icon: PanelTop }, { name: "Solar Inverter", icon: Zap },
  { name: "Solar Battery", icon: Battery }, { name: "On-Grid System", icon: Grid3x3 },
  { name: "Off-Grid System", icon: Power }, { name: "Hybrid System", icon: Combine },
];

const WHY = [
  { t: "Quality Solar Products", d: "Carefully selected panels, inverters and batteries.", icon: CheckCircle2 },
  { t: "Professional Installation", d: "Installed by trained and experienced technicians.", icon: PanelTop },
  { t: "Reliable System Design", d: "Systems designed around your real energy needs.", icon: Grid3x3 },
  { t: "Cost Saving", d: "Reduce your electricity bills with clean solar power.", icon: PiggyBank },
  { t: "After-Sales Support", d: "We stay with you long after installation.", icon: Headset },
  { t: "Maintenance Support", d: "Cleaning, repair and AMC services available.", icon: Wrench },
];

const SOLUTIONS = [
  { t: "Residential Solar", img: "https://images.unsplash.com/photo-1790212763318-bcbbc1831cdd?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { t: "Commercial Solar", img: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { t: "Industrial Solar", img: "https://images.unsplash.com/photo-1629726797843-618688139f5a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { t: "On-Grid Solar", img: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { t: "Off-Grid Solar", img: "https://images.unsplash.com/photo-1660330589257-813305a4a383?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
  { t: "Hybrid Solar", img: "https://images.unsplash.com/photo-1589276534126-adef63a95e05?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" },
];

export default function Home() {
  const { settings } = useSettings();
  const { data: services } = usePublicContent("services");
  const { data: projects } = usePublicContent("projects");
  const { data: gallery } = usePublicContent("gallery");
  const { data: testimonials } = usePublicContent("testimonials");
  const { data: faqs } = usePublicContent("faqs");

  useEffect(() => { document.title = settings.seo_title || "SUN SWITCH | Solar Energy Solutions"; }, [settings]);

  const heroImg = mediaUrl(settings.hero_image) || "https://images.unsplash.com/photo-1790212763318-bcbbc1831cdd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Modern home with rooftop solar panels in bright sunlight" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy-dark/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/50 to-transparent" />
        </div>
        <div className={`${CONTAINER} relative py-24`}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-block text-solar font-bold uppercase tracking-[0.2em] text-sm mb-4" data-no-overline data-testid="hero-eyebrow">
              {settings.hero_eyebrow}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05]">
              {settings.hero_title}
            </h1>
            <p className="mt-6 text-lg text-slate-200 leading-relaxed max-w-xl">{settings.hero_subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="btn-solar text-white rounded-full font-semibold px-7 h-12 text-base border-0">
                <Link to="/quote" data-testid="hero-quote-btn">GET A FREE QUOTE</Link>
              </Button>
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-7 h-12 transition-colors" data-testid="hero-whatsapp-btn">
                <MessageCircle className="w-5 h-5" /> CHAT ON WHATSAPP
              </a>
              <a href={telLink(settings.phone)} className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 text-white hover:bg-white hover:text-navy font-semibold px-7 h-12 transition-colors" data-testid="hero-call-btn">
                <Phone className="w-5 h-5" /> CALL NOW
              </a>
              <Button asChild variant="outline" className="rounded-full border-2 border-white/70 bg-transparent text-white hover:bg-white hover:text-navy font-semibold px-7 h-12 text-base">
                <Link to="/site-survey" data-testid="hero-survey-btn">BOOK A SITE SURVEY</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QUICK PRODUCT CATEGORIES */}
      <Section>
        <TrustBand />
        <SectionHeading center eyebrow="Our Range" title="Solar Products We Offer" subtitle="Everything you need to switch to clean, reliable solar energy." />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {CATEGORIES.map((c, i) => (
            <FadeUp key={c.name} delay={i * 0.05}>
              <Link to="/products" className="group block bg-white border border-slate-200 rounded-2xl p-6 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300" data-testid={`category-${c.name.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="w-14 h-14 mx-auto rounded-full bg-navy/5 group-hover:bg-solar/10 flex items-center justify-center transition-colors">
                  <c.icon className="w-7 h-7 text-navy group-hover:text-solar transition-colors" />
                </div>
                <div className="mt-4 font-semibold text-navy-dark text-sm">{c.name}</div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* WHY CHOOSE */}
      <Section className="bg-white">
        <SectionHeading eyebrow="Why Sun Switch" title="Why Choose Sun Switch?" subtitle="We make going solar simple, reliable and worthwhile." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY.map((w, i) => (
            <FadeUp key={w.t} delay={i * 0.05}>
              <div className="h-full bg-background border border-slate-200 rounded-2xl p-7 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-solar/10 flex items-center justify-center mb-5">
                  <w.icon className="w-6 h-6 text-solar" />
                </div>
                <h3 className="font-heading font-bold text-navy-dark text-lg">{w.t}</h3>
                <p className="mt-2 text-slate-600 text-sm leading-relaxed">{w.d}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* SERVICES */}
      <Section>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeading eyebrow="What We Do" title="Our Services" subtitle="End-to-end solar services from survey to maintenance." />
          <Button asChild variant="ghost" className="text-navy font-semibold mb-12"><Link to="/services" data-testid="services-view-all">View all <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {services.slice(0, 8).map((s, i) => (
            <FadeUp key={s.id} delay={i * 0.04}>
              <Link to="/services" className="group block h-full bg-white border border-slate-200 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-navy/5 group-hover:bg-navy group-hover:text-white text-navy flex items-center justify-center transition-colors">
                  <ServiceIcon name={s.icon} className="w-6 h-6" />
                </div>
                <h3 className="mt-4 font-semibold text-navy-dark">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{s.description}</p>
              </Link>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* SOLAR SOLUTIONS */}
      <Section className="bg-navy-dark">
        <SectionHeading light eyebrow="Solutions" title="Solar Solutions For Everyone" subtitle="Tailored systems for homes, businesses and industries." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((s, i) => (
            <FadeUp key={s.t} delay={i * 0.05}>
              <div className="group relative rounded-2xl overflow-hidden h-56">
                <img src={s.img} alt={s.t} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 to-transparent" />
                <div className="absolute bottom-0 p-6">
                  <h3 className="font-heading font-bold text-white text-xl">{s.t}</h3>
                  <Link to="/quote" className="mt-2 inline-flex items-center gap-1 text-solar text-sm font-semibold">Get a quote <ArrowRight className="w-4 h-4" /></Link>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* SOLAR CALCULATOR */}
      <Section id="solar-calculator" className="gradient-mesh scroll-mt-24">
        <SectionHeading eyebrow="Estimate" title="Solar Savings Calculator" subtitle="Get an instant estimate of your ideal solar system size and savings. Results are approximate estimates only." />
        <SolarCalculator />
      </Section>

      {/* EMI CALCULATOR */}
      <Section id="emi-calculator" className="bg-white scroll-mt-24">
        <SectionHeading eyebrow="Finance" title="Installment (EMI) Calculator" subtitle="Plan your solar investment with an estimated monthly installment. Figures are indicative only." />
        <EmiCalculator />
      </Section>

      {/* QUOTE CTA */}
      <section className="relative py-20">
        <div className={CONTAINER}>
          <div className="relative overflow-hidden rounded-3xl bg-navy p-10 sm:p-14 text-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-solar/20 blur-3xl" />
            <h2 className="relative font-heading text-3xl sm:text-4xl font-bold text-white">Ready to switch and save?</h2>
            <p className="relative mt-4 text-slate-200 max-w-2xl mx-auto">Get a free, no-obligation solar quote tailored to your home or business today.</p>
            <div className="relative mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold px-8 h-12"><Link to="/quote" data-testid="cta-quote-btn">GET A FREE QUOTE</Link></Button>
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-8 h-12 transition-colors"><MessageCircle className="w-5 h-5" /> WHATSAPP</a>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS PREVIEW */}
      <Section className="bg-white">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeading eyebrow="Portfolio" title="Recent Projects" subtitle="A look at some of our solar installations." />
          <Button asChild variant="ghost" className="text-navy font-semibold mb-12"><Link to="/projects" data-testid="projects-view-all">View all <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.slice(0, 4).map((p, i) => (
            <FadeUp key={p.id} delay={i * 0.05}>
              <div className="group bg-background border border-slate-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className="h-44 overflow-hidden"><img src={mediaUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-5">
                  <div className="text-xs text-solar font-semibold uppercase tracking-wide">{p.capacity} · {p.project_type}</div>
                  <h3 className="mt-1 font-semibold text-navy-dark line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{p.location}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* GALLERY PREVIEW */}
      <Section>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeading eyebrow="Gallery" title="Our Work In Pictures" />
          <Button asChild variant="ghost" className="text-navy font-semibold mb-12"><Link to="/gallery" data-testid="gallery-view-all">View all <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gallery.slice(0, 8).map((g, i) => (
            <FadeUp key={g.id} delay={i * 0.03}>
              <div className="aspect-square rounded-2xl overflow-hidden group">
                <img src={mediaUrl(g.image_url)} alt={g.title || g.category} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="bg-navy-dark">
        <SectionHeading light center eyebrow="Reviews" title="What Our Customers Say" subtitle="Demo testimonials — manageable from the admin panel." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((t, i) => (
            <FadeUp key={t.id} delay={i * 0.05}>
              <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-7 backdrop-blur-sm">
                <QuoteIcon className="w-8 h-8 text-solar/70 mb-3" />
                <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`w-4 h-4 ${k < (t.rating || 5) ? "text-solar fill-solar" : "text-slate-600"}`} />)}</div>
                <p className="text-slate-200 text-sm leading-relaxed">"{t.review}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-solar/20 text-solar flex items-center justify-center font-bold">{(t.name || "?")[0]}</div>
                  <div><div className="text-white font-semibold text-sm">{t.name}</div><div className="text-slate-400 text-xs">{t.location}</div></div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-white">
        <SectionHeading center eyebrow="Questions" title="Frequently Asked Questions" />
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border border-slate-200 rounded-xl px-5" data-testid={`faq-${f.id}`}>
                <AccordionTrigger className="text-left font-semibold text-navy-dark hover:no-underline">{f.question}</AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CONTACT CTA */}
      <Section>
        <div className="grid lg:grid-cols-2 gap-8 items-center bg-white border border-slate-200 rounded-3xl p-8 sm:p-12">
          <div>
            <SectionHeading eyebrow="Get In Touch" title="Talk To A Solar Expert" subtitle={settings.address} />
            <div className="flex flex-wrap gap-3">
              <a href={telLink(settings.phone)} className="inline-flex items-center gap-2 rounded-full bg-navy text-white font-semibold px-6 h-12 hover:bg-navy-dark transition-colors"><Phone className="w-5 h-5" /> {settings.phone}</a>
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 h-12 transition-colors"><MessageCircle className="w-5 h-5" /> WhatsApp</a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden h-64">
            <img src="https://images.unsplash.com/photo-1624397640148-949b1732bb0a?crop=entropy&cs=srgb&fm=jpg&q=85&w=800" alt="Solar technician installing panels" className="w-full h-full object-cover" />
          </div>
        </div>
      </Section>
    </div>
  );
}

const TRUST = [
  { t: "Free Site Survey", d: "No-obligation assessment", icon: CheckCircle2 },
  { t: "Professional Installation", d: "Trained technicians", icon: PanelTop },
  { t: "After-Sales Support", d: "We stay with you", icon: Headset },
  { t: "Subsidy Assistance", d: "Guidance & paperwork", icon: PiggyBank },
];

function TrustBand() {
  return (
    <div className="relative -mt-36 sm:-mt-32 mb-16 z-10">
      <div className="bg-white rounded-3xl premium-shadow border border-slate-100 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {TRUST.map((t) => (
          <div key={t.t} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-solar to-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <t.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-heading font-bold text-navy-dark leading-tight">{t.t}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ children, className = "", id }) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`}>
      <div className={CONTAINER}>{children}</div>
    </section>
  );
}

function FadeUp({ children, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, delay }} className="h-full">
      {children}
    </motion.div>
  );
}
