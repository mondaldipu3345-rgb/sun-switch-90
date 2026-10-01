import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ImageUpload from "@/components/admin/ImageUpload";

export default function SettingsPage() {
  const { refresh } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Settings | SUN SWITCH Admin";
    api.get("/admin/settings").then(({ data }) => setForm({ social: {}, ...data })).catch(() => toast.error("Failed to load settings"));
  }, []);

  if (!form) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setSocial = (k, v) => setForm((p) => ({ ...p, social: { ...(p.social || {}), [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", form);
      await refresh();
      toast.success("Settings saved");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-heading text-2xl font-bold text-navy-dark">Website Settings</h1><p className="text-sm text-slate-500">Edit business info, content and links.</p></div>
        <Button onClick={save} disabled={saving} className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold" data-testid="settings-save-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save Changes
        </Button>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="business" data-testid="settings-tab-business">Business</TabsTrigger>
          <TabsTrigger value="hero" data-testid="settings-tab-hero">Hero</TabsTrigger>
          <TabsTrigger value="about" data-testid="settings-tab-about">About</TabsTrigger>
          <TabsTrigger value="footer" data-testid="settings-tab-footer">Footer</TabsTrigger>
          <TabsTrigger value="social" data-testid="settings-tab-social">Social</TabsTrigger>
          <TabsTrigger value="seo" data-testid="settings-tab-seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 space-y-4">
          <F label="Business Name"><Input value={form.business_name || ""} onChange={(e) => set("business_name", e.target.value)} data-testid="set-business-name" /></F>
          <F label="Owner Name"><Input value={form.owner_name || ""} onChange={(e) => set("owner_name", e.target.value)} /></F>
          <F label="Tagline"><Input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} /></F>
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Phone"><Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} data-testid="set-phone" /></F>
            <F label="WhatsApp"><Input value={form.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} /></F>
          </div>
          <F label="Email"><Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} /></F>
          <F label="Address"><Textarea rows={2} value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></F>
        </TabsContent>

        <TabsContent value="hero" className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 space-y-4">
          <F label="Hero Eyebrow (marketing line)"><Input value={form.hero_eyebrow || ""} onChange={(e) => set("hero_eyebrow", e.target.value)} data-testid="set-hero-eyebrow" /></F>
          <F label="Hero Title (main headline)"><Textarea rows={2} value={form.hero_title || ""} onChange={(e) => set("hero_title", e.target.value)} /></F>
          <F label="Hero Subtitle"><Textarea rows={3} value={form.hero_subtitle || ""} onChange={(e) => set("hero_subtitle", e.target.value)} /></F>
          <F label="Hero Background Image"><ImageUpload value={form.hero_image} onChange={(v) => set("hero_image", v)} /></F>
        </TabsContent>

        <TabsContent value="about" className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 space-y-4">
          <F label="About Text"><Textarea rows={5} value={form.about_text || ""} onChange={(e) => set("about_text", e.target.value)} data-testid="set-about-text" /></F>
          <F label="About Image"><ImageUpload value={form.about_image} onChange={(v) => set("about_image", v)} /></F>
        </TabsContent>

        <TabsContent value="footer" className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 space-y-4">
          <F label="Footer About Text"><Textarea rows={3} value={form.footer_about || ""} onChange={(e) => set("footer_about", e.target.value)} data-testid="set-footer-about" /></F>
        </TabsContent>

        <TabsContent value="social" className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 space-y-4">
          <F label="Facebook URL"><Input value={form.social?.facebook || ""} onChange={(e) => setSocial("facebook", e.target.value)} data-testid="set-facebook" /></F>
          <F label="Instagram URL"><Input value={form.social?.instagram || ""} onChange={(e) => setSocial("instagram", e.target.value)} /></F>
          <F label="YouTube URL"><Input value={form.social?.youtube || ""} onChange={(e) => setSocial("youtube", e.target.value)} /></F>
          <F label="LinkedIn URL"><Input value={form.social?.linkedin || ""} onChange={(e) => setSocial("linkedin", e.target.value)} /></F>
        </TabsContent>

        <TabsContent value="seo" className="bg-white border border-slate-200 rounded-2xl p-6 mt-4 space-y-4">
          <F label="SEO Title"><Input value={form.seo_title || ""} onChange={(e) => set("seo_title", e.target.value)} data-testid="set-seo-title" /></F>
          <F label="SEO Description"><Textarea rows={3} value={form.seo_description || ""} onChange={(e) => set("seo_description", e.target.value)} /></F>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function F({ label, children }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium text-slate-700">{label}</Label>{children}</div>;
}
