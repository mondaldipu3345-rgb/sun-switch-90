import { useEffect } from "react";
import { CheckCircle2, Wrench, Map, Ruler, Headset, PanelTop } from "lucide-react";
import PageBanner from "@/components/public/PageBanner";
import { useSettings } from "@/context/SettingsContext";
import { mediaUrl } from "@/lib/api";

const POINTS = [
  { icon: PanelTop, t: "Solar Energy Solutions" },
  { icon: Wrench, t: "Professional Installation" },
  { icon: Map, t: "Site Survey" },
  { icon: Ruler, t: "System Design" },
  { icon: CheckCircle2, t: "Maintenance" },
  { icon: Headset, t: "Customer Support" },
];

export default function About() {
  const { settings } = useSettings();
  useEffect(() => { document.title = "About Us | SUN SWITCH"; }, []);
  const img = mediaUrl(settings.about_image) || "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?crop=entropy&cs=srgb&fm=jpg&q=85&w=900";

  return (
    <div>
      <PageBanner breadcrumb="Who We Are" title="About SUN SWITCH" subtitle={settings.tagline} />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-3xl overflow-hidden h-80 lg:h-[26rem] shadow-sm">
            <img src={img} alt="SUN SWITCH solar installation" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-solar" data-no-overline>Our Story</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-navy-dark mt-3 tracking-tight">Powering a brighter, cleaner future</h2>
            <p className="mt-5 text-slate-600 leading-relaxed">{settings.about_text}</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {POINTS.map((p) => (
                <div key={p.t} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4">
                  <div className="w-10 h-10 rounded-lg bg-solar/10 flex items-center justify-center shrink-0"><p.icon className="w-5 h-5 text-solar" /></div>
                  <span className="text-sm font-semibold text-navy-dark">{p.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
