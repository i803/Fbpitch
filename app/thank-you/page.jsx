"use client";

import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 font-sans p-6">
      <div className="bg-white shadow-2xl rounded-xl p-10 md:p-16 max-w-xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-black tracking-tight">
          Thank You for Your Purchase!
        </h1>

        <p className="text-lg md:text-xl mb-8 text-gray-700 leading-relaxed">
          Your order has been successfully placed. We appreciate your business and hope you love your new football kits!
        </p>

        <Link href="/" className="inline-block">
          <button className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 shadow-lg transition-transform transform hover:scale-105">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}
