import { useEffect } from "react";
import PageBanner from "@/components/public/PageBanner";

function LegalPage({ title, children }) {
  useEffect(() => { document.title = `${title} | SUN SWITCH`; }, [title]);
  return (
    <div>
      <PageBanner breadcrumb="Legal" title={title} />
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl prose prose-slate">
          <div className="space-y-5 text-slate-600 leading-relaxed">{children}</div>
        </div>
      </section>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This is a placeholder Privacy Policy for SUN SWITCH. The final policy content can be edited later.</p>
      <p>We collect the information you voluntarily provide through our enquiry and site survey forms (such as name, phone number, email and address) solely to respond to your request and provide solar services.</p>
      <p>We do not sell your personal information. Your data is used only to contact you regarding your enquiry and related solar solutions.</p>
      <p>For any questions about this policy, please contact us using the details on our Contact page.</p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>This is a placeholder Terms &amp; Conditions page for SUN SWITCH. The final terms can be edited later.</p>
      <p>All estimates provided by our calculators and quotes are approximate and for informational purposes only. They do not constitute a guaranteed financial result or a binding offer.</p>
      <p>Final system specifications, pricing and timelines are confirmed only after an on-site survey and formal quotation.</p>
      <p>By using this website and submitting an enquiry, you consent to being contacted by SUN SWITCH regarding your request.</p>
    </LegalPage>
  );
}
