import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Loader2, Phone, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { waLink, telLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STATUSES = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELLED"];

export default function SiteSurveysPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get("/admin/site-surveys"); setItems(data); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { document.title = "Site Surveys | SUN SWITCH Admin"; load(); }, []);

  const changeStatus = async (item, v) => {
    try { await api.patch(`/admin/site-surveys/${item.id}`, { status: v }); setItems((p) => p.map((i) => i.id === item.id ? { ...i, status: v } : i)); }
    catch { toast.error("Update failed"); }
  };
  const del = async (id) => {
    try { await api.delete(`/admin/site-surveys/${id}`); load(); toast.success("Deleted"); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div>
      <div className="mb-6"><h1 className="font-heading text-2xl font-bold text-navy-dark">Site Survey Requests</h1><p className="text-sm text-slate-500">{items.length} requests</p></div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Ref</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead>
                <TableHead>Date</TableHead><TableHead>Time</TableHead><TableHead>Property</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-navy" /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-slate-400">No site survey requests yet.</TableCell></TableRow>
              ) : items.map((s) => (
                <TableRow key={s.id} data-testid={`survey-row-${s.id}`}>
                  <TableCell className="font-mono text-xs">{s.ref_id}</TableCell>
                  <TableCell className="font-semibold text-navy-dark">{s.name}</TableCell>
                  <TableCell>{s.phone}</TableCell>
                  <TableCell>{s.preferred_date || "—"}</TableCell>
                  <TableCell className="text-xs">{s.preferred_time || "—"}</TableCell>
                  <TableCell>{s.property_type || "—"}</TableCell>
                  <TableCell>
                    <Select value={s.status || "NEW"} onValueChange={(v) => changeStatus(s, v)}>
                      <SelectTrigger className="h-8 text-xs w-32" data-testid={`survey-status-${s.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <a href={telLink(s.phone)} className="inline-flex p-2 text-navy" title="Call"><Phone className="w-4 h-4" /></a>
                    <a href={waLink(s.whatsapp || s.phone)} target="_blank" rel="noreferrer" className="inline-flex p-2 text-[#25D366]" title="WhatsApp"><MessageCircle className="w-4 h-4" /></a>
                    <Button variant="ghost" size="sm" onClick={() => del(s.id)} className="text-rose-500" data-testid={`survey-delete-${s.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
