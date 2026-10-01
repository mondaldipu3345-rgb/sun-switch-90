import { motion } from "framer-motion";

export function SectionHeading({ eyebrow, title, subtitle, center = false, light = false }) {
  return (
    <div className={`${center ? "text-center mx-auto max-w-2xl" : "max-w-3xl"} mb-12`}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-solar mb-3" data-no-overline>
          {eyebrow}
        </span>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`font-heading text-3xl sm:text-4xl font-bold tracking-tight ${light ? "text-white" : "text-navy-dark"}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed ${light ? "text-slate-300" : "text-slate-600"}`}>{subtitle}</p>
      )}
    </div>
  );
}
