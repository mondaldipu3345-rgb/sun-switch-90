import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Download, Trash2, Eye, Loader2, Phone, MessageCircle } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { LEAD_STATUSES, STATUS_COLORS, waLink, telLink } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/leads", { params: { status, q } });
      setLeads(data);
    } catch { toast.error("Failed to load leads"); }
    finally { setLoading(false); }
  }, [status, q]);

  useEffect(() => { document.title = "Leads | SUN SWITCH Admin"; }, []);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const changeStatus = async (lead, newStatus) => {
    try {
      await api.patch(`/admin/leads/${lead.id}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, status: newStatus } : l)));
      toast.success("Status updated");
    } catch { toast.error("Could not update status"); }
  };

  const confirmDelete = async () => {
    try { await api.delete(`/admin/leads/${deleteId}`); setDeleteId(null); load(); toast.success("Lead deleted"); }
    catch { toast.error("Delete failed"); }
  };

  const exportCsv = async () => {
    try {
      const res = await api.get("/admin/leads-export", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = "sunswitch_leads.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-dark">Lead Management</h1>
          <p className="text-sm text-slate-500">{leads.length} leads</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="rounded-full border-navy text-navy" data-testid="leads-export-btn"><Download className="w-4 h-4 mr-1" /> Export CSV</Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, city, lead ID…" className="pl-9" data-testid="leads-search" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48" data-testid="leads-status-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Lead ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-navy" /></TableCell></TableRow>
              ) : leads.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-slate-400">No leads found.</TableCell></TableRow>
              ) : leads.map((l) => (
                <TableRow key={l.id} data-testid={`lead-row-${l.id}`}>
                  <TableCell className="font-mono text-xs">{l.lead_id}</TableCell>
                  <TableCell className="font-semibold text-navy-dark">{l.full_name}</TableCell>
                  <TableCell>{l.phone}</TableCell>
                  <TableCell>{l.city || "—"}</TableCell>
                  <TableCell className="max-w-[160px] truncate text-sm text-slate-500">{l.interested_product || l.interested_service || "—"}</TableCell>
                  <TableCell><span className="text-xs bg-slate-100 rounded-full px-2 py-0.5 capitalize">{l.source}</span></TableCell>
                  <TableCell>
                    <Select value={l.status} onValueChange={(v) => changeStatus(l, v)}>
                      <SelectTrigger className={`h-8 text-xs w-36 border ${STATUS_COLORS[l.status] || ""}`} data-testid={`lead-status-${l.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => setView(l)} data-testid={`lead-view-${l.id}`}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(l.id)} className="text-rose-500" data-testid={`lead-delete-${l.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scroll-thin">
          <DialogHeader><DialogTitle>Lead {view?.lead_id}</DialogTitle></DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              {[
                ["Name", view.full_name], ["Phone", view.phone], ["WhatsApp", view.whatsapp],
                ["Email", view.email], ["Address", view.address], ["City", view.city], ["PIN", view.pin_code],
                ["Property Type", view.property_type], ["Monthly Bill", view.monthly_bill],
                ["Interested Product", view.interested_product], ["Interested Service", view.interested_service],
                ["Required Capacity", view.required_capacity], ["Message", view.message],
                ["Source", view.source], ["Date", view.created_at?.slice(0, 10)],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3 py-1.5 border-b border-slate-100">
                  <span className="w-40 shrink-0 text-slate-500">{k}</span>
                  <span className="text-navy-dark font-medium break-all">{v || "—"}</span>
                </div>
              ))}
              <div className="flex gap-3 pt-3">
                <a href={telLink(view.phone)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-navy text-white py-2 font-semibold"><Phone className="w-4 h-4" /> Call</a>
                <a href={waLink(view.whatsapp || view.phone)} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white py-2 font-semibold"><MessageCircle className="w-4 h-4" /> WhatsApp</a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this lead?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-600">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
