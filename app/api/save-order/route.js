import { NextResponse } from "next/server";
import { connectToDB } from "../../../lib/mongoose";
import Order from "../../../models/Order";
import nodemailer from "nodemailer";
import axios from "axios";

async function sendOrderEmail({ orderId, amount, customer, paymentMethod, promoCode, discountPercent }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL,
      pass: process.env.CONTACT_EMAIL_PASSWORD,
    },
  });

  let promoText = "";
  if (promoCode) {
    promoText = `\nPromo Code: ${promoCode}\nDiscount: ${discountPercent}%`;
  }

  await transporter.sendMail({
    from: `"Fbpitch Orders" <${process.env.CONTACT_EMAIL}>`,
    to: process.env.ADMIN_NOTIFICATION_EMAIL,
    subject: "New Order Received",
    text: `Customer: ${customer}\nAmount: KD ${amount}\nOrder ID: ${orderId}\nPayment Method: ${paymentMethod}${promoText}`,
  });
}

export async function POST(request) {
  try {
    const { orderId, amount, customer, paymentMethod, promoCode, discountPercent } = await request.json();
    await connectToDB();

    if (paymentMethod === "COD") {
      // Save COD order directly (promo info saved but not validated here)
      await Order.create({ orderId, amount, customer, paymentMethod, promoCode, discountPercent });
      await sendOrderEmail({ orderId, amount, customer, paymentMethod, promoCode, discountPercent });
      return NextResponse.json({ success: true });
    }

    // PayPal payment verification
    const tokenRes = await axios({
      url: "https://api-m.paypal.com/v1/oauth2/token",
      method: "POST",
      auth: {
        username: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      params: { grant_type: "client_credentials" },
    });

    const accessToken = tokenRes.data.access_token;

    const orderRes = await axios({
      url: `https://api-m.paypal.com/v2/checkout/orders/${orderId}`,
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (orderRes.data.status !== "COMPLETED") {
      return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
    }

    await Order.create({ orderId, amount, customer, paymentMethod: "PayPal", promoCode, discountPercent });
    await sendOrderEmail({ orderId, amount, customer, paymentMethod: "PayPal", promoCode, discountPercent });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save Order Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
