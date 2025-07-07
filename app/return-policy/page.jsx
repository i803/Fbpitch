"use client";

export default function ReturnPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-serif space-y-8">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900">Return Policy</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Overview</h2>
        <p className="leading-relaxed text-lg">
          We want you to be fully satisfied with your purchase. If you're not happy with your order, you can return it within 14 days of delivery for a refund or exchange.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Eligibility</h2>
        <ul className="list-disc list-inside ml-6 mt-3 space-y-2 text-lg">
          <li>Items must be unused, unwashed, and in their original condition.</li>
          <li>Return requests must be initiated within 14 days of receipt.</li>
          <li>Custom or personalized items are non-returnable.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">How to Return</h2>
        <p className="leading-relaxed text-lg">
          Contact our support team at fbpitchhelp@gmail.com with your order details to initiate a return. We'll guide you through the process.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Refunds</h2>
        <p className="leading-relaxed text-lg">
          Refunds will be processed to the original payment method within 7 business days after we receive the returned items.
        </p>
      </section>
    </div>
  );
}
