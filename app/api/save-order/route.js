import { google } from "googleapis";
import nodemailer from "nodemailer";
import axios from "axios";
import Order from "@/models/Order";
import { connectToDB } from "@/lib/mongoose";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function sendOrderEmail({
  orderId,
  amount,
  customer,
  paymentMethod,
  promoCode,
  discountPercent,
  address,
  items,
}) {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD,
      },
    });

    const htmlItems = items
      .map(
        (item) =>
          `<li>${item.name} - Size: ${item.size}, Quality: ${item.quality}, Price: KD ${parseFloat(
            item.price
          ).toFixed(3)}</li>`
      )
      .join("");

    const html = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Amount:</strong> KD ${parseFloat(amount).toFixed(3)}</p>
      <p><strong>Customer:</strong> ${customer}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Promo Code:</strong> ${promoCode || "N/A"}</p>
      <p><strong>Discount Percent:</strong> ${discountPercent || 0}%</p>
      <h3>Shipping Address</h3>
      <p>
        ${address.firstName} ${address.lastName}<br/>
        Phone: ${address.phone}<br/>
        ${address.street}<br/>
        ${address.city}, ${address.state} ${address.postal || ""}
      </p>
      <h3>Items</h3>
      <ul>${htmlItems}</ul>
    `;

    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL,
      to: process.env.ADMIN_NOTIFICATION_EMAIL,
      subject: `New Order: ${orderId}`,
      html,
    });

    console.log("Admin notification email sent");
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
  }
}

async function appendOrderToGoogleSheets(order) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        private_key: (process.env.GS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
        client_email: process.env.GS_CLIENT_EMAIL,
      },
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: "v4", auth });

    const values = order.items.map((item) => [
      order.orderId,
      order.customer,
      order.paymentMethod,
      order.promoCode || "",
      order.discountPercent || "",
      item.name,
      item.size || "",
      item.quality || "",
      item.sleeve || "",
      item.patch || "",
      item.customName || "",
      item.instagram || "",
      item.addShorts ? "Yes" : "No",
      parseFloat(item.price).toFixed(3),
      order.address.firstName,
      order.address.lastName,
      order.address.phone,
      order.address.street,
      order.address.city,
      order.address.state,
      order.address.postal || "",
      new Date().toLocaleString(),
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GS_SHEET_ID,
      range: "Orders",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    console.log("Order appended to Google Sheets");
  } catch (error) {
    console.error("Failed to append order to Google Sheets:", error);
    throw error;
  }
}

async function verifyPaypalPayment(orderId, amount) {
  try {
    const authResponse = await axios({
      method: "post",
      url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      auth: {
        username: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: "grant_type=client_credentials",
    });

    const accessToken = authResponse.data.access_token;

    const orderResponse = await axios({
      method: "get",
      url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const paypalOrder = orderResponse.data;
    if (
      paypalOrder.status !== "COMPLETED" ||
      Number(paypalOrder.purchase_units[0].amount.value) !== Number(amount)
    ) {
      throw new Error("PayPal payment verification failed");
    }

    return true;
  } catch (error) {
    console.error("PayPal verification error:", error);
    throw error;
  }
}

export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json();

    const {
      orderId,
      amount,
      customer,
      paymentMethod,
      promoCode,
      discountPercent,
      address,
      items,
    } = body;

    if (
      !orderId ||
      !amount ||
      !customer ||
      !paymentMethod ||
      !address ||
      !items ||
      !Array.isArray(items)
    ) {
      return new Response(JSON.stringify({ error: "Invalid order data" }), {
        status: 400,
      });
    }

    const phoneRegex = /^(5|6|9)\d{7}$/;
    if (!phoneRegex.test(address.phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format" }),
        { status: 400 }
      );
    }

    if (paymentMethod === "PayPal") {
      await verifyPaypalPayment(orderId, amount);
    }

    const orderDoc = new Order({
      orderId,
      amount,
      customer,
      paymentMethod,
      promoCode,
      discountPercent,
      phone: address.phone,
      address,
      items,
    });

    await orderDoc.save();

    await appendOrderToGoogleSheets(body);
    await sendOrderEmail(body);

    return new Response(
      JSON.stringify({ message: "Order saved successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Save Order Error:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
