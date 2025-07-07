"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-contact-messages")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMessages(data.messages);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch contact messages:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading contact messages...</div>;

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar />
      <main className="flex-grow p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
        {messages.length === 0 ? (
          <p>No contact messages found.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map(({ _id, name, email, message, createdAt }) => (
              <li key={_id} className="border p-4 rounded shadow-sm">
                <p>
                  <strong>Name:</strong> {name}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Message:</strong> {message}
                </p>
                <p className="text-sm text-gray-500">
                  Sent on: {new Date(createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
