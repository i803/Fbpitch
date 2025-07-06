"use client";

import { useState } from "react";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here (e.g., API call)
    setSuccess(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-6 sm:px-12 text-gray-900 font-sans">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8 text-indigo-900 text-center">Contact Us</h1>

      <p className="text-lg mb-8 text-center">
        Have questions or feedback? We're here to help! Fill out the form below and we'll get back to you soon.
      </p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Thank you for contacting us! We'll respond shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <textarea
          placeholder="Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          required
          className="w-full p-3 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
        ></textarea>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
