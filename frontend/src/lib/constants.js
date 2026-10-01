export const NAV_LINKS = [
  { label: "HOME", to: "/" },
  { label: "ABOUT US", to: "/about" },
  { label: "PRODUCTS", to: "/products" },
  { label: "SERVICES", to: "/services" },
  { label: "PROJECTS", to: "/projects" },
  { label: "GALLERY", to: "/gallery" },
  { label: "TESTIMONIALS", to: "/testimonials" },
  { label: "CONTACT", to: "/contact" },
];

export const PRODUCT_CATEGORIES = [
  "Solar Panel", "Solar Inverter", "Solar Battery",
  "On-Grid System", "Off-Grid System", "Hybrid System",
];

export const SERVICE_OPTIONS = [
  "Solar Installation", "Site Survey", "Solar System Design",
  "Repair & Maintenance", "Solar Panel Cleaning", "AMC",
  "Net Metering Assistance", "Subsidy Assistance",
];

export const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Agricultural", "Other"];

export const LEAD_STATUSES = [
  "NEW", "CONTACTED", "SITE SURVEY", "QUOTATION",
  "CONFIRMED", "INSTALLATION", "COMPLETED", "CANCELLED",
];

export const STATUS_COLORS = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTED: "bg-amber-100 text-amber-700 border-amber-200",
  "SITE SURVEY": "bg-purple-100 text-purple-700 border-purple-200",
  QUOTATION: "bg-cyan-100 text-cyan-700 border-cyan-200",
  CONFIRMED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  INSTALLATION: "bg-orange-100 text-orange-700 border-orange-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
};

export const digits = (s) => (s || "").replace(/[^0-9]/g, "");
export const waLink = (num) => `https://wa.me/${digits(num) || "919083646566"}`;
export const telLink = (num) => `tel:+${digits(num) || "919083646566"}`;
