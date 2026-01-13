import { google } from "googleapis";

export async function appendOrderToGoogleSheets(order: any) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      project_id: process.env.GS_PROJECT_ID,
      private_key: process.env.GS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.GS_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const sheetId = process.env.GS_SHEET_ID;
  const sheetName = "Orders"; // Must match your tab name

  const rows = order.items.map((item: any) => [
    order.orderId,
    order.customer,
    order.paymentMethod,
    order.promoCode || "",
    order.discountPercent || 0,
    item.productName || item.name,
    item.size || "",
    item.quality || "",
    item.sleeve || item.sleeves || "",
    Array.isArray(item.patches) ? item.patches.join(", ") : item.patches || "",
    item.customName || "",
    item.instagram || "", // optional field
    item.addShorts || item.shortsSelected || item.shorts ? "Yes" : "No",
    item.price || 0,
    order.shippingAddress.firstName,
    order.shippingAddress.lastName,
    order.shippingAddress.phone,
    order.shippingAddress.street,
    order.shippingAddress.city,
    order.shippingAddress.state,
    order.shippingAddress.postal || "",
    new Date().toISOString(),
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}
