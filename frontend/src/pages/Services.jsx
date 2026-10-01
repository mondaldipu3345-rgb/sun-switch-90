import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import PageBanner from "@/components/public/PageBanner";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import { usePublicContent } from "@/lib/hooks";
import { mediaUrl } from "@/lib/api";

export default function Services() {
  const { data: services, loading } = usePublicContent("services");
  useEffect(() => { document.title = "Services | SUN SWITCH"; }, []);

  return (
    <div>
      <PageBanner breadcrumb="What We Do" title="Our Solar Services" subtitle="From the first site survey to long-term maintenance, we handle it all." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {loading ? <p className="text-slate-400">Loading services…</p> : (
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow duration-300" data-testid={`service-card-${i}`}>
                  <div className="sm:w-44 h-40 sm:h-auto shrink-0 overflow-hidden"><img src={mediaUrl(s.image_url)} alt={s.title} className="w-full h-full object-cover" /></div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-navy/5 text-navy flex items-center justify-center"><ServiceIcon name={s.icon} className="w-6 h-6" /></div>
                      <h3 className="font-heading text-lg font-bold text-navy-dark">{s.title}</h3>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{s.description}</p>
                    {Array.isArray(s.benefits) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {s.benefits.map((b, k) => <span key={k} className="inline-flex items-center gap-1 text-xs bg-eco/10 text-eco-dark rounded-full px-2.5 py-1"><Check className="w-3 h-3" /> {b}</span>)}
                      </div>
                    )}
                    <div className="mt-5 flex gap-3">
                      <Button asChild className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold"><Link to={`/quote?service=${encodeURIComponent(s.title)}`} data-testid={`service-enquire-${i}`}>Enquire Now</Link></Button>
                      <Button asChild variant="outline" className="rounded-full border-2 border-navy text-navy"><Link to="/site-survey">Book Service</Link></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
