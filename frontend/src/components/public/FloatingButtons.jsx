import { Phone, MessageCircle } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { waLink, telLink } from "@/lib/constants";

export default function FloatingButtons() {
  const { settings } = useSettings();
  return (
    <>
      <a
        href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform animate-float"
        aria-label="Chat on WhatsApp" data-testid="floating-whatsapp"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
      <a
        href={telLink(settings.phone)}
        className="fixed bottom-5 left-5 z-40 w-14 h-14 rounded-full bg-navy hover:bg-navy-dark text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform lg:hidden"
        aria-label="Call now" data-testid="floating-call"
      >
        <Phone className="w-6 h-6" />
      </a>
    </>
  );
}
