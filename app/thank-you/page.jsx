"use client";

import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-white to-gray-100 font-sans relative">
      <Sidebar />

      <main className="flex-grow p-6 md:p-10 max-w-3xl mx-auto md:ml-72 flex flex-col justify-center items-center text-center text-gray-900">
        <div className="bg-white shadow-xl rounded-xl p-8 md:p-12 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black tracking-tight">
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
      </main>
    </div>
  );
}
