import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, MessageCircle, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, waLink, telLink } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const social = settings.social || {};
  const socialIcons = [
    { Icon: Facebook, url: social.facebook, key: "facebook" },
    { Icon: Instagram, url: social.instagram, key: "instagram" },
    { Icon: Youtube, url: social.youtube, key: "youtube" },
    { Icon: Linkedin, url: social.linkedin, key: "linkedin" },
  ];

  return (
    <header className="sticky top-0 z-50" data-testid="site-header">
      {/* Top contact bar */}
      <div className="hidden md:block bg-navy-dark text-slate-200 text-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between h-10">
          <div className="flex items-center gap-6">
            <a href={telLink(settings.phone)} className="flex items-center gap-2 hover:text-solar transition-colors" data-testid="topbar-phone">
              <Phone className="w-3.5 h-3.5" /> {settings.phone}
            </a>
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-solar transition-colors" data-testid="topbar-whatsapp">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-solar transition-colors" data-testid="topbar-email">
              <Mail className="w-3.5 h-3.5" /> {settings.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {socialIcons.map(({ Icon, url, key }) => (
              <a key={key} href={url || "#"} target="_blank" rel="noreferrer" className="hover:text-solar transition-colors" aria-label={key} data-testid={`topbar-social-${key}`}>
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className={`transition-all duration-300 border-b ${scrolled ? "backdrop-blur-xl bg-white/90 border-slate-200 shadow-sm" : "bg-white border-transparent"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3" data-testid="header-logo-link">
            <Logo size={scrolled ? 42 : 48} />
            <div className="leading-tight">
              <div className="font-heading font-extrabold text-navy text-lg lg:text-xl tracking-tight">SUN SWITCH</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-solar font-semibold whitespace-nowrap">The energy of future</div>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-5 2xl:gap-7">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-semibold tracking-wide whitespace-nowrap transition-colors hover:text-solar ${location.pathname === l.to ? "text-solar" : "text-slate-700"}`}
                data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <Button onClick={() => navigate("/quote")} className="btn-solar text-white rounded-full font-semibold border-0 px-5 whitespace-nowrap" data-testid="header-quote-btn">GET A QUOTE</Button>
            <Button onClick={() => navigate("/site-survey")} variant="outline" className="border-2 border-navy text-navy hover:bg-navy hover:text-white rounded-full font-semibold px-4 whitespace-nowrap" data-testid="header-survey-btn">SITE SURVEY</Button>
          </div>

          <button className="xl:hidden p-2 text-navy" onClick={() => setOpen(!open)} aria-label="Toggle menu" data-testid="mobile-menu-toggle">
            {open ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden bg-white border-b border-slate-200 shadow-lg" data-testid="mobile-menu">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1 max-w-7xl">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={`py-3 px-3 rounded-lg font-semibold ${location.pathname === l.to ? "bg-navy/5 text-solar" : "text-slate-700"}`} data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3">
              <Button onClick={() => navigate("/quote")} className="bg-solar hover:bg-solar-dark text-white rounded-full w-full" data-testid="mobile-quote-btn">GET A QUOTE</Button>
              <Button onClick={() => navigate("/site-survey")} variant="outline" className="border-2 border-navy text-navy rounded-full w-full" data-testid="mobile-survey-btn">BOOK A SITE SURVEY</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
