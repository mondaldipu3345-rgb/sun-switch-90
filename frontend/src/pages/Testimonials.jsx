import { useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote as QuoteIcon } from "lucide-react";
import PageBanner from "@/components/public/PageBanner";
import { usePublicContent } from "@/lib/hooks";
import { mediaUrl } from "@/lib/api";

export default function Testimonials() {
  const { data: testimonials, loading } = usePublicContent("testimonials");
  useEffect(() => { document.title = "Testimonials | SUN SWITCH"; }, []);

  return (
    <div>
      <PageBanner breadcrumb="Reviews" title="Customer Testimonials" subtitle="Demo testimonials shown below — these are managed from the admin panel." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {loading ? <p className="text-slate-400">Loading…</p> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-md transition-shadow duration-300" data-testid={`testimonial-card-${i}`}>
                  <QuoteIcon className="w-9 h-9 text-solar/40 mb-3" />
                  <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className={`w-4 h-4 ${k < (t.rating || 5) ? "text-solar fill-solar" : "text-slate-200"}`} />)}</div>
                  <p className="text-slate-700 leading-relaxed">"{t.review}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    {t.photo_url ? <img src={mediaUrl(t.photo_url)} alt={t.name} className="w-12 h-12 rounded-full object-cover" /> :
                      <div className="w-12 h-12 rounded-full bg-navy/10 text-navy flex items-center justify-center font-bold text-lg">{(t.name || "?")[0]}</div>}
                    <div><div className="font-semibold text-navy-dark">{t.name}</div><div className="text-sm text-slate-500">{t.location}</div></div>
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
