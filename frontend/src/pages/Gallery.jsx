import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageBanner from "@/components/public/PageBanner";
import { usePublicContent } from "@/lib/hooks";
import { mediaUrl } from "@/lib/api";

const CATEGORIES = ["All", "Solar Installation", "Solar Panels", "Inverter", "Battery", "Projects", "Team", "Office", "Other"];

export default function Gallery() {
  const { data: gallery, loading } = usePublicContent("gallery");
  const [active, setActive] = useState("All");
  useEffect(() => { document.title = "Gallery | SUN SWITCH"; }, []);

  const filtered = useMemo(
    () => (active === "All" ? gallery : gallery.filter((g) => g.category === active)),
    [gallery, active]
  );

  return (
    <div>
      <PageBanner breadcrumb="Our Work" title="Gallery" subtitle="A visual look at our solar products, installations and projects." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActive(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${active === c ? "bg-navy text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-navy"}`}
                data-testid={`gallery-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}>
                {c}
              </button>
            ))}
          </div>
          {loading ? <p className="text-slate-400">Loading gallery…</p> : filtered.length === 0 ? (
            <p className="text-slate-400">No images in this category yet.</p>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {filtered.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 8) * 0.03 }}
                  className="break-inside-avoid rounded-2xl overflow-hidden group relative" data-testid={`gallery-item-${i}`}>
                  <img src={mediaUrl(g.image_url)} alt={g.title || g.category} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-navy-dark/0 group-hover:bg-navy-dark/40 transition-colors flex items-end p-4">
                    <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{g.category}</span>
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
