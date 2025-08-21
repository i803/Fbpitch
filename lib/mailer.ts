import nodemailer from "nodemailer";

const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
const contactEmail = process.env.CONTACT_EMAIL;
const contactPassword = process.env.CONTACT_EMAIL_PASSWORD;

if (!adminEmail || !contactEmail || !contactPassword) {
  console.warn("⚠️ Missing email config in .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: contactEmail,
    pass: contactPassword, // App password if using Gmail
  },
});

// Cloudinary shop logo
const shopLogoUrl =
  "https://res.cloudinary.com/decmbnxuz/image/upload/v1755619771/icon_zbyprs.png";

// -------------------------
// Admin Notification Only
// -------------------------
export async function sendAdminOrderNotification(orderId: string, order: any) {
  if (!transporter || !adminEmail) return;

  const total = order.totalAmount ?? 0;
  const user = order.shippingAddress?.name ?? order.userId ?? "Guest";

  // Build items HTML table
  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
    <tr>
      <td style="padding:8px;border:1px solid #eee;">${item.name || "Product"}</td>
      <td style="padding:8px;border:1px solid #eee;text-align:center;">${item.quantity ?? 1}</td>
      <td style="padding:8px;border:1px solid #eee;text-align:right;">${item.price?.toFixed?.(2) ?? item.price ?? "-"}</td>
    </tr>
  `
    )
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:8px;">
    <div style="text-align:center;margin-bottom:20px;">
      <img src="${shopLogoUrl}" alt="FbPitch" style="max-width:160px;" />
    </div>
    <h2 style="color:#333;text-align:center;">New Order Received</h2>
    <p style="color:#555;text-align:center;">Order ID: <strong>${orderId}</strong></p>
    <p style="color:#555;text-align:center;">Customer: <strong>${user}</strong></p>
    <p style="color:#555;text-align:center;">Total: <strong>${total.toFixed(2)} KWD</strong></p>

    <h3 style="border-bottom:1px solid #ddd;padding-bottom:5px;color:#333;">Items</h3>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;background:#fff;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #eee;text-align:left;background:#f2f2f2;">Product</th>
          <th style="padding:8px;border:1px solid #eee;text-align:center;background:#f2f2f2;">Qty</th>
          <th style="padding:8px;border:1px solid #eee;text-align:right;background:#f2f2f2;">Price (KWD)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding:8px;border:1px solid #eee;text-align:right;font-weight:bold;">Total</td>
          <td style="padding:8px;border:1px solid #eee;text-align:right;font-weight:bold;">${total.toFixed(
            2
          )}</td>
        </tr>
      </tbody>
    </table>

    <p style="color:#555;text-align:center;margin-top:20px;">
      Check the admin panel for full details.
    </p>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: `"FbPitch Shop" <${contactEmail}>`,
      to: adminEmail,
      subject: `🛒 New Order #${orderId}`,
      html,
    });

    console.log("✅ Admin email sent successfully");
  } catch (err) {
    console.error("⚠️ Failed to send admin email:", err);
  }
}

// Customer emails intentionally disabled
export async function sendCustomerOrderReceipt(orderId: string, order: any) {
  return;
}
