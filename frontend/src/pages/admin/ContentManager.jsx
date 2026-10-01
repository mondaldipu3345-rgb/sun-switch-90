import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { api, mediaUrl, formatApiError } from "@/lib/api";
import { CONTENT_CONFIG } from "@/pages/admin/content-config";
import ImageUpload from "@/components/admin/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function ContentManager({ collection }) {
  const cfg = CONTENT_CONFIG[collection];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { document.title = `${cfg.label} | SUN SWITCH Admin`; load(); /* eslint-disable-next-line */ }, [collection]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/content/${collection}`);
      setItems(data);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const openNew = () => {
    const blank = {};
    cfg.fields.forEach((f) => { blank[f.name] = f.type === "list" ? "" : ""; });
    if (cfg.publishable) blank.published = true;
    setForm(blank); setEditing(null); setDialogOpen(true);
  };

  const openEdit = (item) => {
    const f = { ...item };
    cfg.fields.forEach((fld) => { if (fld.type === "list" && Array.isArray(f[fld.name])) f[fld.name] = f[fld.name].join("\n"); });
    setForm(f); setEditing(item); setDialogOpen(true);
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const payload = { ...form };
    cfg.fields.forEach((f) => {
      if (f.type === "list") payload[f.name] = (payload[f.name] || "").split("\n").map((s) => s.trim()).filter(Boolean);
      if (f.type === "number") payload[f.name] = Number(payload[f.name]) || 0;
    });
    setSaving(true);
    try {
      if (editing) await api.put(`/admin/content/${collection}/${editing.id}`, payload);
      else await api.post(`/admin/content/${collection}`, payload);
      toast.success(`${cfg.singular} ${editing ? "updated" : "added"}`);
      setDialogOpen(false); load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Save failed");
    } finally { setSaving(false); }
  };

  const togglePublish = async (item) => {
    try {
      await api.put(`/admin/content/${collection}/${item.id}`, { published: !item.published });
      load();
    } catch { toast.error("Failed to update"); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/content/${collection}/${deleteId}`);
      toast.success(`${cfg.singular} deleted`);
      setDeleteId(null); load();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy-dark">{cfg.label}</h1>
          <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? cfg.singular.toLowerCase() : cfg.label.toLowerCase()}</p>
        </div>
        <Button onClick={openNew} className="bg-solar hover:bg-solar-dark text-white rounded-full font-semibold" data-testid="content-add-btn">
          <Plus className="w-4 h-4 mr-1" /> Add {cfg.singular}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-16">Image</TableHead>
                {cfg.columns.map((c) => <TableHead key={c.name}>{c.label}</TableHead>)}
                {cfg.publishable && <TableHead>Status</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-slate-400">No {cfg.label.toLowerCase()} yet. Click "Add {cfg.singular}".</TableCell></TableRow>
              ) : items.map((item) => (
                <TableRow key={item.id} data-testid={`content-row-${item.id}`}>
                  <TableCell>
                    <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                      {(item.image_url || item.photo_url) ? <img src={mediaUrl(item.image_url || item.photo_url)} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400">—</span>}
                    </div>
                  </TableCell>
                  {cfg.columns.map((c) => <TableCell key={c.name} className="max-w-[240px] truncate">{String(item[c.name] ?? "")}</TableCell>)}
                  {cfg.publishable && (
                    <TableCell>
                      <button onClick={() => togglePublish(item)} className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 ${item.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`} data-testid={`toggle-publish-${item.id}`}>
                        {item.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {item.published ? "Published" : "Hidden"}
                      </button>
                    </TableCell>
                  )}
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} data-testid={`edit-${item.id}`}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(item.id)} className="text-rose-500 hover:text-rose-600" data-testid={`delete-${item.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scroll-thin">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} {cfg.singular}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {cfg.fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">{f.label}</Label>
                {f.type === "text" && <Input value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} data-testid={`field-${f.name}`} />}
                {f.type === "number" && <Input type="number" value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} data-testid={`field-${f.name}`} />}
                {f.type === "textarea" && <Textarea rows={3} value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} data-testid={`field-${f.name}`} />}
                {f.type === "list" && <Textarea rows={4} value={form[f.name] || ""} onChange={(e) => set(f.name, e.target.value)} placeholder="One item per line" data-testid={`field-${f.name}`} />}
                {f.type === "image" && <ImageUpload value={form[f.name]} onChange={(v) => set(f.name, v)} />}
                {f.type === "select" && (
                  <Select value={form[f.name] || ""} onValueChange={(v) => set(f.name, v)}>
                    <SelectTrigger data-testid={`field-${f.name}`}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            ))}
            {cfg.publishable && (
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <Label className="text-sm font-medium text-slate-700">Published (visible on website)</Label>
                <Switch checked={!!form.published} onCheckedChange={(v) => set("published", v)} data-testid="field-published" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-solar hover:bg-solar-dark text-white" data-testid="content-save-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {cfg.singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-rose-500 hover:bg-rose-600" data-testid="confirm-delete-btn">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
