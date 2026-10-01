export default function PageBanner({ title, subtitle, breadcrumb }) {
  return (
    <section className="relative bg-navy-dark pt-16 pb-14 overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-solar/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-navy-light/20 blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        {breadcrumb && <div className="text-xs uppercase tracking-[0.2em] text-solar font-semibold mb-3" data-no-overline>{breadcrumb}</div>}
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="mt-4 text-slate-300 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
