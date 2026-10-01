import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ClipboardList, CalendarCheck, Package, Wrench,
  FolderKanban, Image, MessageSquareQuote, HelpCircle, Newspaper, Settings,
  KeyRound, LogOut, Menu, X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/leads", label: "Leads", icon: ClipboardList },
  { to: "/admin/site-surveys", label: "Site Surveys", icon: CalendarCheck },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/faqs", label: "FAQ", icon: HelpCircle },
  { to: "/admin/blog", label: "Blog / News", icon: Newspaper },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/change-password", label: "Change Password", icon: KeyRound },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const doLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-navy-dark text-slate-300 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <Logo size={36} />
          <div className="font-heading font-extrabold text-white">SUN SWITCH</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scroll-thin">
          {LINKS.map((l) => (
            <NavLink
              key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-solar text-white" : "hover:bg-white/5 hover:text-white"}`}
              data-testid={`admin-nav-${l.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
            >
              <l.icon className="w-4.5 h-4.5 w-5 h-5" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={doLogout} className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-white/5 hover:bg-rose-500 hover:text-white transition-colors" data-testid="admin-logout-btn">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
          <button className="lg:hidden text-navy" onClick={() => setOpen(!open)} data-testid="admin-menu-toggle">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="font-heading font-bold text-navy-dark hidden sm:block">Admin Panel</div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-navy-dark">{user?.name || "Admin"}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold">{(user?.name || "A")[0]}</div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
