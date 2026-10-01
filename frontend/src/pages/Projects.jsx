import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Zap } from "lucide-react";
import PageBanner from "@/components/public/PageBanner";
import { Button } from "@/components/ui/button";
import { usePublicContent } from "@/lib/hooks";
import { mediaUrl } from "@/lib/api";

export default function Projects() {
  const { data: projects, loading } = usePublicContent("projects");
  useEffect(() => { document.title = "Projects | SUN SWITCH"; }, []);

  return (
    <div>
      <PageBanner breadcrumb="Portfolio" title="Our Projects" subtitle="A selection of solar installations we have delivered." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {loading ? <p className="text-slate-400">Loading projects…</p> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300" data-testid={`project-card-${i}`}>
                  <div className="h-52 overflow-hidden relative">
                    <img src={mediaUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-solar text-white text-xs font-semibold px-3 py-1 rounded-full">{p.project_type}</span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-bold text-navy-dark">{p.name}</h3>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-navy" /> {p.location}</span>
                      <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-solar" /> {p.capacity}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">{p.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-14">
            <Button asChild className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold px-8 h-12"><Link to="/quote">Start Your Solar Project</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
