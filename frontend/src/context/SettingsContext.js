import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const DEFAULTS = {
  business_name: "SUN SWITCH",
  owner_name: "DIPANKAR MONDAL",
  tagline: "The energy of future",
  phone: "+91 9083646566",
  whatsapp: "+91 9083646566",
  email: "info@sunswitch.co.in",
  address: "MATIA BAZAR, ARBALIA ROAD, NORTH 24 PGS, WEST BENGAL, INDIA",
  hero_eyebrow: "SUN LIGHT IS FREE; SWITCH AND SAVE TODAY.",
  hero_title: "BRIGHTEN YOUR HOME WITH TATA POWER SOLAR.",
  hero_subtitle: "",
  hero_image: "",
  about_text: "",
  about_image: "",
  footer_about: "",
  social: { facebook: "#", instagram: "#", youtube: "#", linkedin: "#" },
};

const SettingsContext = createContext({ settings: DEFAULTS, refresh: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);

  const refresh = async () => {
    try {
      const { data } = await api.get("/public/settings");
      if (data && data.business_name) setSettings({ ...DEFAULTS, ...data });
    } catch (e) {
      /* keep defaults */
    }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <SettingsContext.Provider value={{ settings, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
