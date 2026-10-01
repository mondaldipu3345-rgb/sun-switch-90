import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Loader2 } from "lucide-react";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES, SERVICE_OPTIONS, PROPERTY_TYPES, waLink, telLink } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

const EMPTY = {
  full_name: "", phone: "", whatsapp: "", email: "", address: "", city: "", pin_code: "",
  property_type: "", monthly_bill: "", interested_product: "", interested_service: "",
  required_capacity: "", message: "",
};

export default function LeadForm({ source = "quote", presetProduct = "", presetService = "" }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [form, setForm] = useState({ ...EMPTY, interested_product: presetProduct, interested_service: presetService });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/public/leads", { ...form, source });
      toast.success(`Enquiry submitted! Your reference is ${data.lead_id}. We will contact you soon.`);
      setForm({ ...EMPTY, interested_product: presetProduct, interested_service: presetService });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" data-testid="lead-form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *"><Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your full name" data-testid="lead-name" /></Field>
        <Field label="Phone Number *"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." data-testid="lead-phone" /></Field>
        <Field label="WhatsApp Number"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+91 ..." data-testid="lead-whatsapp" /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" data-testid="lead-email" /></Field>
        <Field label="Address"><Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street / locality" data-testid="lead-address" /></Field>
        <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City / town" data-testid="lead-city" /></Field>
        <Field label="PIN Code"><Input value={form.pin_code} onChange={(e) => set("pin_code", e.target.value)} placeholder="700xxx" data-testid="lead-pin" /></Field>
        <Field label="Property Type">
          <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
            <SelectTrigger data-testid="lead-property-type"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>{PROPERTY_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Monthly Electricity Bill (₹)"><Input value={form.monthly_bill} onChange={(e) => set("monthly_bill", e.target.value)} placeholder="e.g. 3000" data-testid="lead-bill" /></Field>
        <Field label="Required Solar Capacity"><Input value={form.required_capacity} onChange={(e) => set("required_capacity", e.target.value)} placeholder="e.g. 5 kW" data-testid="lead-capacity" /></Field>
        <Field label="Interested Product">
          <Select value={form.interested_product} onValueChange={(v) => set("interested_product", v)}>
            <SelectTrigger data-testid="lead-product"><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>{PRODUCT_CATEGORIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Interested Service">
          <Select value={form.interested_service} onValueChange={(v) => set("interested_service", v)}>
            <SelectTrigger data-testid="lead-service"><SelectValue placeholder="Select service" /></SelectTrigger>
            <SelectContent>{SERVICE_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Message"><Textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your requirement" rows={3} data-testid="lead-message" /></Field>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" disabled={loading} className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold px-8 flex-1 sm:flex-none" data-testid="lead-submit">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} SUBMIT ENQUIRY
        </Button>
        <a href={telLink(settings.phone)} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy text-navy font-semibold px-6 py-2.5 hover:bg-navy hover:text-white transition-colors" data-testid="lead-call-btn"><Phone className="w-4 h-4" /> CALL NOW</a>
        <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-6 py-2.5 transition-colors" data-testid="lead-whatsapp-btn"><MessageCircle className="w-4 h-4" /> WHATSAPP US</a>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}
