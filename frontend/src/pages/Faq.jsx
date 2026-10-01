import { useEffect } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import PageBanner from "@/components/public/PageBanner";
import { usePublicContent } from "@/lib/hooks";

export default function Faq() {
  const { data: faqs, loading } = usePublicContent("faqs");
  useEffect(() => { document.title = "FAQ | SUN SWITCH"; }, []);

  return (
    <div>
      <PageBanner breadcrumb="Help" title="Frequently Asked Questions" subtitle="Answers to common questions about going solar with SUN SWITCH." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {loading ? <p className="text-slate-400">Loading…</p> : (
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f) => (
                <AccordionItem key={f.id} value={f.id} className="border border-slate-200 rounded-xl px-5 bg-white" data-testid={`faq-item-${f.id}`}>
                  <AccordionTrigger className="text-left font-semibold text-navy-dark hover:no-underline">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    </div>
  );
}
