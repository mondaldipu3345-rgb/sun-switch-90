import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Phone, MessageCircle } from "lucide-react";
import PageBanner from "@/components/public/PageBanner";
import { api, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PROPERTY_TYPES, waLink, telLink } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

const TIME_SLOTS = ["09:00 AM - 11:00 AM", "11:00 AM - 01:00 PM", "02:00 PM - 04:00 PM", "04:00 PM - 06:00 PM"];
const EMPTY = { name: "", phone: "", whatsapp: "", address: "", property_type: "", preferred_time: "", message: "" };

export default function SiteSurvey() {
  const { settings } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { document.title = "Book a Site Survey | SUN SWITCH"; }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Please enter your name and phone number."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/public/site-surveys", { ...form, preferred_date: date ? format(date, "dd MMM yyyy") : "" });
      toast.success(`Site survey request submitted! Reference: ${data.ref_id}. We will confirm your slot soon.`);
      setForm(EMPTY); setDate(null);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not submit. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageBanner breadcrumb="Free Assessment" title="Book a Site Survey" subtitle="Schedule a free on-site assessment of your roof and energy needs." />
      <section className="py-20 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4" data-testid="survey-form">
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Name *"><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" data-testid="survey-name" /></F>
              <F label="Phone *"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." data-testid="survey-phone" /></F>
              <F label="WhatsApp"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 ..." data-testid="survey-whatsapp" /></F>
              <F label="Property Type">
                <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                  <SelectTrigger data-testid="survey-property"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{PROPERTY_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </F>
            </div>
            <F label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address for the survey" data-testid="survey-address" /></F>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Preferred Date">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start font-normal border-slate-300" data-testid="survey-date">
                      <CalendarIcon className="w-4 h-4 mr-2 text-slate-500" />
                      {date ? format(date, "dd MMM yyyy") : <span className="text-slate-400">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                  </PopoverContent>
                </Popover>
              </F>
              <F label="Preferred Time">
                <Select value={form.preferred_time} onValueChange={(v) => set("preferred_time", v)}>
                  <SelectTrigger data-testid="survey-time"><SelectValue placeholder="Select slot" /></SelectTrigger>
                  <SelectContent>{TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </F>
            </div>
            <F label="Message"><Textarea value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} placeholder="Anything we should know?" data-testid="survey-message" /></F>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={loading} className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold px-8" data-testid="survey-submit">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} BOOK SITE SURVEY
              </Button>
              <a href={telLink(settings.phone)} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy text-navy font-semibold px-6 py-2.5 hover:bg-navy hover:text-white transition-colors"><Phone className="w-4 h-4" /> CALL NOW</a>
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-2.5 transition-colors"><MessageCircle className="w-4 h-4" /> WHATSAPP</a>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function F({ label, children }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-700">{label}</Label>{children}</div>;
}
