import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageBanner from "@/components/public/PageBanner";
import LeadForm from "@/components/public/LeadForm";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { waLink, telLink } from "@/lib/constants";

export default function Quote() {
  const [params] = useSearchParams();
  const { settings } = useSettings();
  useEffect(() => { document.title = "Get a Free Quote | SUN SWITCH"; }, []);

  return (
    <div>
      <PageBanner breadcrumb="Free Estimate" title="Get a Free Solar Quote" subtitle="Fill in your details and our team will get back to you with a tailored solar quote." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-heading text-2xl font-bold text-navy-dark mb-6">Enquiry Details</h2>
            <LeadForm source="quote" presetProduct={params.get("product") || ""} presetService={params.get("service") || ""} />
          </div>
          <aside className="space-y-4">
            <div className="bg-navy rounded-2xl p-7 text-white">
              <h3 className="font-heading font-bold text-xl mb-4">Contact Us Directly</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-solar shrink-0" /><span>{settings.address}</span></li>
                <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-solar" /><a href={telLink(settings.phone)} className="hover:text-solar">{settings.phone}</a></li>
                <li className="flex items-center gap-3"><MessageCircle className="w-5 h-5 text-solar" /><a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="hover:text-solar">{settings.whatsapp}</a></li>
                <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-solar" /><a href={`mailto:${settings.email}`} className="hover:text-solar break-all">{settings.email}</a></li>
                <li className="flex items-center gap-3"><Clock className="w-5 h-5 text-solar" /><span>Mon – Sat, 9:00 AM – 7:00 PM</span></li>
              </ul>
            </div>
            <div className="bg-eco/10 border border-eco/30 rounded-2xl p-6">
              <p className="text-sm text-slate-700 leading-relaxed">Prefer to talk? Call or WhatsApp us and we'll help you choose the right solar system for your needs.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
