import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { SettingsProvider } from "@/context/SettingsContext";
import { AuthProvider } from "@/context/AuthContext";

import PublicLayout from "@/components/public/PublicLayout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Services from "@/pages/Services";
import Projects from "@/pages/Projects";
import Gallery from "@/pages/Gallery";
import Testimonials from "@/pages/Testimonials";
import Contact from "@/pages/Contact";
import Quote from "@/pages/Quote";
import SiteSurvey from "@/pages/SiteSurvey";
import Faq from "@/pages/Faq";
import { Privacy, Terms } from "@/pages/Legal";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import LeadsPage from "@/pages/admin/LeadsPage";
import SiteSurveysPage from "@/pages/admin/SiteSurveysPage";
import ContentManager from "@/pages/admin/ContentManager";
import SettingsPage from "@/pages/admin/SettingsPage";
import ChangePassword from "@/pages/admin/ChangePassword";

function App() {
  return (
    <div className="App">
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/services" element={<Services />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/quote" element={<Quote />} />
                <Route path="/site-survey" element={<SiteSurvey />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Route>

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="leads" element={<LeadsPage />} />
                <Route path="site-surveys" element={<SiteSurveysPage />} />
                <Route path="products" element={<ContentManager collection="products" />} />
                <Route path="services" element={<ContentManager collection="services" />} />
                <Route path="projects" element={<ContentManager collection="projects" />} />
                <Route path="gallery" element={<ContentManager collection="gallery" />} />
                <Route path="testimonials" element={<ContentManager collection="testimonials" />} />
                <Route path="faqs" element={<ContentManager collection="faqs" />} />
                <Route path="blog" element={<ContentManager collection="blog" />} />
                <Route path="customers" element={<ContentManager collection="customers" />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Routes>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </div>
  );
}

export default App;
