import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList, Sparkles, PhoneCall, CalendarCheck, FileText, Users, FolderKanban, Package, Wrench, Loader2,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import { api } from "@/lib/api";
import { STATUS_COLORS } from "@/lib/constants";

const STAT_META = [
  { key: "total_enquiries", label: "Total Enquiries", icon: ClipboardList, color: "bg-navy text-white" },
  { key: "new_enquiries", label: "New Enquiries", icon: Sparkles, color: "bg-blue-500 text-white" },
  { key: "contacted", label: "Contacted", icon: PhoneCall, color: "bg-amber-500 text-white" },
  { key: "site_survey_requests", label: "Site Survey Requests", icon: CalendarCheck, color: "bg-purple-500 text-white" },
  { key: "quote_requests", label: "Quote Requests", icon: FileText, color: "bg-cyan-500 text-white" },
  { key: "customers", label: "Customers", icon: Users, color: "bg-emerald-500 text-white" },
  { key: "projects", label: "Projects", icon: FolderKanban, color: "bg-indigo-500 text-white" },
  { key: "products", label: "Products", icon: Package, color: "bg-solar text-white" },
  { key: "services", label: "Services", icon: Wrench, color: "bg-rose-500 text-white" },
];

const BAR_COLORS = ["#3B82F6", "#F59E0B", "#A855F7", "#06B6D4", "#6366F1", "#F97316", "#10B981", "#F43F5E"];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    document.title = "Dashboard | SUN SWITCH Admin";
    api.get("/admin/dashboard").then(({ data }) => setData(data)).catch(() => {});
  }, []);

  if (!data) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-navy" /></div>;

  const { stats, trend, status_breakdown, recent_leads } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy-dark">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of your enquiries and content.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {STAT_META.map((m) => (
          <div key={m.key} className="bg-white rounded-2xl border border-slate-200 p-5" data-testid={`stat-${m.key}`}>
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}><m.icon className="w-5 h-5" /></div>
            <div className="font-heading text-3xl font-bold text-navy-dark">{stats[m.key] ?? 0}</div>
            <div className="text-xs text-slate-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-heading font-bold text-navy-dark mb-4">Enquiries (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F97316" stopOpacity={0.4} /><stop offset="95%" stopColor="#F97316" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="enquiries" stroke="#F97316" strokeWidth={2} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-heading font-bold text-navy-dark mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={status_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="status" tick={{ fontSize: 9 }} stroke="#94a3b8" interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {status_breakdown.map((e, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-bold text-navy-dark">Recent Enquiries</h3>
          <Link to="/admin/leads" className="text-sm text-solar font-semibold">View all</Link>
        </div>
        {recent_leads.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">No enquiries yet.</p> : (
          <div className="divide-y divide-slate-100">
            {recent_leads.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-semibold text-navy-dark text-sm">{l.full_name}</div>
                  <div className="text-xs text-slate-500">{l.phone} · {l.city || "—"}</div>
                </div>
                <span className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${STATUS_COLORS[l.status] || ""}`}>{l.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
