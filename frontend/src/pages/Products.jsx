import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import PageBanner from "@/components/public/PageBanner";
import { Button } from "@/components/ui/button";
import { usePublicContent } from "@/lib/hooks";
import { mediaUrl } from "@/lib/api";

export default function Products() {
  const { data: products, loading } = usePublicContent("products");
  useEffect(() => { document.title = "Products | SUN SWITCH"; }, []);

  return (
    <div>
      <PageBanner breadcrumb="Shop Solar" title="Our Solar Products" subtitle="Quality solar panels, inverters, batteries and complete systems." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {loading ? <p className="text-slate-400">Loading products…</p> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300" data-testid={`product-card-${i}`}>
                  <div className="h-52 overflow-hidden"><img src={mediaUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                  <div className="p-6 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-solar uppercase tracking-wide">{p.category}</span>
                    <h3 className="font-heading text-xl font-bold text-navy-dark mt-1">{p.name}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{p.short_description}</p>
                    {Array.isArray(p.features) && p.features.length > 0 && (
                      <ul className="mt-4 space-y-2 flex-1">
                        {p.features.map((f, k) => (
                          <li key={k} className="flex items-center gap-2 text-sm text-slate-700"><Check className="w-4 h-4 text-eco shrink-0" /> {f}</li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-6 flex gap-3">
                      <Button asChild className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold flex-1"><Link to={`/quote?product=${encodeURIComponent(p.category || p.name)}`} data-testid={`product-enquire-${i}`}>Enquire Now</Link></Button>
                      <Button asChild variant="outline" className="rounded-full border-2 border-navy text-navy"><Link to="/contact"><ArrowRight className="w-4 h-4" /></Link></Button>
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
