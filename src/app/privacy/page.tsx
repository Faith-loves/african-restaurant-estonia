import type { Metadata } from "next";

import SiteHeader from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy information for African Restaurant Estonia website visitors, customers and enquiry submissions.",
  alternates: { canonical: "https://africanrestaurant.ee/privacy" },
  openGraph: { title: "Privacy Policy | African Restaurant Estonia", description: "Privacy information for African Restaurant Estonia.", url: "https://africanrestaurant.ee/privacy" },
};

const heading = "font-[var(--font-cormorant)] text-3xl font-bold text-[#321B29] sm:text-4xl";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#FFF8EC] px-5 py-12 text-[#151313] sm:px-8 sm:py-16">
        <article className="mx-auto max-w-4xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B9472E]">African Restaurant Estonia</p>
          <h1 className="mt-3 font-[var(--font-cormorant)] text-5xl font-bold text-[#321B29]">Privacy Policy</h1>
          <p className="mt-4 text-sm font-semibold text-[#151313]/55">Last updated: 17 October 2026</p>

          <div className="mt-10 space-y-9 text-sm font-medium leading-7 text-[#151313]/75">
            <section><h2 className={heading}>1. Who we are</h2><p className="mt-3">This policy explains how African Restaurant Estonia processes information through its website. The owner should add the full legal entity name and a dedicated privacy contact before relying on this as a formal legal notice.</p></section>
            <section><h2 className={heading}>2. Information we process</h2><p className="mt-3">Depending on how you use the website, we may process your name and email address; food-order contact, fulfilment, delivery, item, total and status information; and catering or Gift Box enquiry details.</p></section>
            <section><h2 className={heading}>3. Accounts and guest orders</h2><p className="mt-3">You may create a customer account or continue as a guest where available. Guest order details are needed to process and communicate about the order. Guest sessions use an HTTP-only browser cookie and are not used for analytics.</p></section>
            <section><h2 className={heading}>4. Google Analytics</h2><p className="mt-3">If you choose “Accept analytics”, the website uses Google Analytics 4 to measure anonymous website visits and page views, including the page path and page title. Analytics is not loaded before consent, is disabled on local and preview environments, and is excluded from the admin area. We do not send customer names, email addresses, phone numbers, delivery addresses, payment information or order contents to Google Analytics.</p><p className="mt-3">Your analytics choice is stored in this browser’s local storage under an analytics-consent setting. Select “Privacy settings” on the website to change or withdraw your choice. Rejecting analytics does not affect authentication, the cart, guest sessions or ordering.</p></section>
            <section><h2 className={heading}>5. Why we use information</h2><ul className="mt-3 list-disc space-y-2 pl-6"><li>to process and manage food orders;</li><li>to contact you about an order or enquiry;</li><li>to manage customer accounts;</li><li>to protect the service against fraud and abuse;</li><li>to administer and improve the restaurant service; and</li><li>to understand ordering activity and service needs.</li></ul></section>
            <section><h2 className={heading}>6. GDPR and legal bases</h2><p className="mt-3">For people in Estonia and the European Economic Area, processing may be based on taking steps requested before an order, performing that arrangement, legitimate interests, legal obligations, or consent where consent is requested. The applicable basis depends on the processing activity.</p></section>
            <section><h2 className={heading}>7. Sharing and retention</h2><p className="mt-3">We do not sell customer information. Information may be shared only as needed to provide requested services or where lawful disclosure is required. We retain information only for as long as reasonably necessary for order and service administration, customer support, applicable legal or accounting obligations, and dispute or security purposes. Specific retention periods and any automated deletion schedule should be confirmed by the owner.</p></section>
            <section><h2 className={heading}>8. Your rights</h2><p className="mt-3">Subject to applicable law, you may have rights to access, rectify, erase or restrict processing, object to certain processing, receive portable data where applicable, and withdraw consent. You may also lodge a complaint with the competent supervisory authority. Contact us to exercise a right or ask a question.</p></section>
            <section><h2 className={heading}>9. Security</h2><p className="mt-3">We take reasonable care to protect the information we hold. No online service can be guaranteed completely secure, so please use care when submitting information online.</p></section>
            <section><h2 className={heading}>10. Updates and contact</h2><p className="mt-3">We may update this policy when the website or processing changes. The updated date is shown at the top of this page. The owner should provide the final legal entity, privacy contact and supervisory-authority details before production legal review.</p></section>
          </div>
        </article>
      </main>
    </>
  );
}
