"use client";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-serif space-y-8">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900">Terms & Conditions</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Acceptance of Terms</h2>
        <p className="leading-relaxed text-lg">
          By using MBF Kits, you agree to comply with and be bound by these terms and conditions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Ordering</h2>
        <p className="leading-relaxed text-lg">
          All orders are subject to availability and confirmation of the order price.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Payments</h2>
        <p className="leading-relaxed text-lg">
          Payments are processed securely via PayPal. Prices are subject to change without notice.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Shipping & Delivery</h2>
        <p className="leading-relaxed text-lg">
          We strive to deliver orders promptly but are not responsible for delays outside our control.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Limitation of Liability</h2>
        <p className="leading-relaxed text-lg">
          MBF Kits is not liable for indirect or consequential damages arising from product use.
        </p>
      </section>
    </div>
  );
}
