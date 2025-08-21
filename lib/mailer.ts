// lib/mailer.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Cloudinary-hosted shop logo
const shopLogoUrl = "https://res.cloudinary.com/decmbnxuz/image/upload/v1755619771/icon_zbyprs.png";

// -------------------------
// Admin Notification
// -------------------------
export async function sendAdminOrderNotification(orderId: string, order: any) {
  if (!resend || !adminEmail) return;

  const total = order.total ?? order.amount ?? order.totalKWD ?? "N/A";
  const user = order.userId ?? order.customer ?? "guest";

  try {
    await resend.emails.send({
      from: "Shop <no-reply@yourdomain.com>",
      to: adminEmail,
      subject: `🛒 New Order #${orderId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
          <img src="${shopLogoUrl}" alt="FbPitch" style="max-width:160px;margin-bottom:20px;" />
          <h2>New Order Received</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>User:</strong> ${user}</p>
          <p><strong>Total:</strong> ${total}</p>
          <p>Check the admin panel for full details.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("⚠️ Failed to send admin email:", err);
  }
}

// -------------------------
// Customer Receipt
// -------------------------
export async function sendCustomerOrderReceipt(orderId: string, order: any) {
  if (!resend || !order.customerEmail) return; // must have email

  const total = order.total ?? order.amount ?? order.totalKWD ?? 0;

  const itemsHtml = (order.items || [])
    .map(
      (item: any) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.productName || item.name || "Product"}</td>
          <td style="padding:8px;border:1px solid #ddd;">${item.quantity || 1}</td>
          <td style="padding:8px;border:1px solid #ddd;">${
            item.price?.toFixed ? item.price.toFixed(2) : item.price ?? "-"
          }</td>
        </tr>
      `
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Shop <no-reply@yourdomain.com>",
      to: order.customerEmail,
      subject: `✅ Your Order Receipt (#${orderId})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
          <div style="text-align:center;">
            <img src="${shopLogoUrl}" alt="FbPitch" style="max-width:160px;margin-bottom:20px;" />
          </div>
          <h2 style="color:#333;text-align:center;">Thank you for your order!</h2>
          <p style="text-align:center;color:#666;">We’ve received your order and will notify you once it ships.</p>

          <h3 style="margin-top:20px;border-bottom:1px solid #ddd;padding-bottom:5px;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Amount:</strong> ${total}</p>
          <p><strong>Customer:</strong> ${order.customer ?? "N/A"}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod ?? "N/A"}</p>
          <p><strong>Promo Code:</strong> ${order.promoCode ?? "-"}</p>
          <p><strong>Discount:</strong> ${order.discountPercent ?? 0}%</p>
          <p><strong>Shipping Address:</strong><br/>${order.address ?? "N/A"}</p>

          <h3 style="margin-top:20px;border-bottom:1px solid #ddd;padding-bottom:5px;">Items</h3>
          <table style="width:100%;border-collapse:collapse;margin-top:10px;">
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #ddd;text-align:left;background:#f9f9f9;">Product</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:left;background:#f9f9f9;">Qty</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:left;background:#f9f9f9;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding:8px;border:1px solid #ddd;text-align:right;font-weight:bold;">Total</td>
                <td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${total}</td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top:20px;color:#555;text-align:center;">
            We appreciate your business!<br/>
            – The FbPitch Team
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("⚠️ Failed to send customer email:", err);
  }
}
