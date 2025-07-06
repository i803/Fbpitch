"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function TestPayPal() {
  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <PayPalButtons style={{ layout: "vertical" }} />
    </PayPalScriptProvider>
  );
}
