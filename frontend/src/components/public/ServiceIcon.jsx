import {
  SunMedium, MapPin, Ruler, Wrench, Sparkles, ShieldCheck, Plug, BadgeCheck, PanelTop,
} from "lucide-react";

const MAP = {
  panels: PanelTop, map: MapPin, ruler: Ruler, wrench: Wrench,
  sparkles: Sparkles, shield: ShieldCheck, plug: Plug, badge: BadgeCheck,
};

export function ServiceIcon({ name, className }) {
  const Icon = MAP[name] || SunMedium;
  return <Icon className={className} />;
}
