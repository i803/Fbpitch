"use client";

export default function CareInstructions() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-serif space-y-8">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900">Care Instructions</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Washing</h2>
        <p className="leading-relaxed text-lg">
          Machine wash cold with like colors. Use mild detergent. Avoid bleach to maintain vibrant colors.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Drying</h2>
        <p className="leading-relaxed text-lg">
          Tumble dry low or hang dry to avoid shrinking or damage to fabric.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Ironing</h2>
        <p className="leading-relaxed text-lg">
          If needed, iron on low heat. Avoid ironing directly on printed or embroidered areas.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-3 border-b border-indigo-300 pb-2">Storage</h2>
        <p className="leading-relaxed text-lg">
          Store in a cool, dry place away from direct sunlight to preserve fabric quality and colors.
        </p>
      </section>
    </div>
  );
}
