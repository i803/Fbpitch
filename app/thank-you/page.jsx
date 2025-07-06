"use client";

import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      <Sidebar />

      <main className="flex-grow p-8 max-w-4xl mx-auto md:ml-64 flex flex-col justify-center items-center text-center text-gray-900">
        <h1 className="text-4xl font-extrabold mb-6">Thank You for Your Purchase!</h1>
        <p className="text-lg mb-8">
          Your order has been successfully placed. We appreciate your business and hope you love your new kits!
        </p>
        <Link href="/">
          <button className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition">
            Continue Shopping
          </button>
        </Link>
      </main>
    </div>
  );
}
