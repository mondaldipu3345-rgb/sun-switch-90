import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle, MapPin, Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useSettings } from "@/context/SettingsContext";
import { waLink, telLink } from "@/lib/constants";

const quickLinks = [
  ["Home", "/"], ["About Us", "/about"], ["Products", "/products"], ["Services", "/services"],
  ["Projects", "/projects"], ["Gallery", "/gallery"], ["Testimonials", "/testimonials"], ["Contact", "/contact"],
];
const usefulLinks = [
  ["Get a Quote", "/quote"], ["Solar Calculator", "/#solar-calculator"], ["Installment Calculator", "/#emi-calculator"],
  ["Book a Site Survey", "/site-survey"], ["FAQ", "/faq"], ["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"],
];
const productLinks = ["Solar Panel", "Solar Inverter", "Solar Battery", "On-Grid System", "Off-Grid System", "Hybrid System"];

export default function Footer() {
  const { settings } = useSettings();
  const social = settings.social || {};
  const socialIcons = [
    { Icon: Facebook, url: social.facebook, key: "facebook" },
    { Icon: Instagram, url: social.instagram, key: "instagram" },
    { Icon: Youtube, url: social.youtube, key: "youtube" },
    { Icon: Linkedin, url: social.linkedin, key: "linkedin" },
  ];

  return (
    <footer className="bg-navy-dark text-slate-300" data-testid="site-footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1 */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Logo size={48} />
              <div>
                <div className="font-heading font-extrabold text-white text-lg">SUN SWITCH</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-solar font-semibold">The energy of future</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">{settings.footer_about || "Quality solar products, professional installation and reliable after-sales support."}</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-solar shrink-0" /><span>{settings.address}</span></li>
              <li><a href={telLink(settings.phone)} className="flex items-center gap-2 hover:text-solar"><Phone className="w-4 h-4 text-solar" />{settings.phone}</a></li>
              <li><a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-solar"><MessageCircle className="w-4 h-4 text-solar" />{settings.whatsapp}</a></li>
              <li><a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-solar"><Mail className="w-4 h-4 text-solar" />{settings.email}</a></li>
            </ul>
          </div>

          <FooterCol title="Quick Links">
            {quickLinks.map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-solar transition-colors">{label}</Link></li>
            ))}
          </FooterCol>

          <FooterCol title="Useful Links">
            {usefulLinks.map(([label, to]) => (
              <li key={label}><Link to={to} className="hover:text-solar transition-colors">{label}</Link></li>
            ))}
          </FooterCol>

          <FooterCol title="Our Products">
            {productLinks.map((p) => (
              <li key={p}><Link to="/products" className="hover:text-solar transition-colors">{p}</Link></li>
            ))}
          </FooterCol>

          <div>
            <h4 className="font-heading font-bold text-white mb-4 text-base">Follow Us</h4>
            <div className="flex gap-3 mb-6">
              {socialIcons.map(({ Icon, url, key }) => (
                <a key={key} href={url || "#"} target="_blank" rel="noreferrer" aria-label={key}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-solar flex items-center justify-center transition-colors" data-testid={`footer-social-${key}`}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
            <Link to="/quote" className="inline-block bg-solar hover:bg-solar-dark text-white font-semibold rounded-full px-5 py-2.5 text-sm transition-colors" data-testid="footer-quote-btn">Get a Free Quote</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 max-w-7xl py-5 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} SUN SWITCH. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <h4 className="font-heading font-bold text-white mb-4 text-base">{title}</h4>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}
