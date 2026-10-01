import { PRODUCT_CATEGORIES } from "@/lib/constants";

const GALLERY_CATEGORIES = ["Solar Installation", "Solar Panels", "Inverter", "Battery", "Projects", "Team", "Office", "Other"];
const ICON_OPTIONS = ["panels", "map", "ruler", "wrench", "sparkles", "shield", "plug", "badge"];

export const CONTENT_CONFIG = {
  products: {
    label: "Products", singular: "Product", publishable: true,
    columns: [{ name: "name", label: "Name" }, { name: "category", label: "Category" }],
    fields: [
      { name: "name", label: "Product Name", type: "text" },
      { name: "category", label: "Category", type: "select", options: PRODUCT_CATEGORIES },
      { name: "image_url", label: "Image", type: "image" },
      { name: "short_description", label: "Short Description", type: "textarea" },
      { name: "features", label: "Features (one per line)", type: "list" },
    ],
  },
  services: {
    label: "Services", singular: "Service", publishable: true,
    columns: [{ name: "title", label: "Title" }, { name: "icon", label: "Icon" }],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "icon", label: "Icon", type: "select", options: ICON_OPTIONS },
      { name: "image_url", label: "Image", type: "image" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "benefits", label: "Benefits (one per line)", type: "list" },
    ],
  },
  projects: {
    label: "Projects", singular: "Project", publishable: true,
    columns: [{ name: "name", label: "Name" }, { name: "location", label: "Location" }, { name: "capacity", label: "Capacity" }],
    fields: [
      { name: "name", label: "Project Name", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "capacity", label: "Capacity", type: "text" },
      { name: "project_type", label: "Project Type", type: "text" },
      { name: "image_url", label: "Image", type: "image" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  gallery: {
    label: "Gallery", singular: "Image", publishable: true,
    columns: [{ name: "title", label: "Title" }, { name: "category", label: "Category" }],
    fields: [
      { name: "title", label: "Title / Caption", type: "text" },
      { name: "category", label: "Category", type: "select", options: GALLERY_CATEGORIES },
      { name: "image_url", label: "Image", type: "image" },
    ],
  },
  testimonials: {
    label: "Testimonials", singular: "Testimonial", publishable: true,
    columns: [{ name: "name", label: "Name" }, { name: "location", label: "Location" }, { name: "rating", label: "Rating" }],
    fields: [
      { name: "name", label: "Customer Name", type: "text" },
      { name: "location", label: "Location", type: "text" },
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "photo_url", label: "Photo (optional)", type: "image" },
      { name: "review", label: "Review", type: "textarea" },
    ],
  },
  faqs: {
    label: "FAQ", singular: "FAQ", publishable: true,
    columns: [{ name: "question", label: "Question" }],
    fields: [
      { name: "question", label: "Question", type: "text" },
      { name: "answer", label: "Answer", type: "textarea" },
    ],
  },
  blog: {
    label: "Blog / News", singular: "Post", publishable: true,
    columns: [{ name: "title", label: "Title" }, { name: "author", label: "Author" }],
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "author", label: "Author", type: "text" },
      { name: "image_url", label: "Cover Image", type: "image" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "content", label: "Content", type: "textarea" },
    ],
  },
  customers: {
    label: "Customers", singular: "Customer", publishable: false,
    columns: [{ name: "name", label: "Name" }, { name: "phone", label: "Phone" }, { name: "city", label: "City" }],
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "city", label: "City", type: "text" },
      { name: "address", label: "Address", type: "textarea" },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
};
