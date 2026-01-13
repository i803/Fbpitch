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
  const sheetName = "Orders";

  if (!Array.isArray(order.items)) {
    console.error("❌ No items sent to Google Sheets");
    return;
  }

  const rows = order.items.map((item: any) => [
    // ── Order
    item._id || "",                    // Order ID
    item.customerName || "",            // Customer
    item.paymentMethod || "",           // Payment Method
    item.promoCode || "",               // Promo Code
    item.discount ?? 0,                 // Discount %

    // ── Product
    item.name || "",                    // Product Name
    item.size || "",
    item.quality || "",
    item.sleeve || "",
    item.patch || "",
    item.customName || "",
    item.instagram || "",
    item.shortsAdded ? "Yes" : "No",
    item.price ?? 0,

    // ── Address
    item.firstName || "",
    item.lastName || "",
    item.phone || "",
    item.street || "",
    item.city || "",
    item.state || "",
    item.postal || "",

    // ── Timestamp
    new Date().toLocaleString(),
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  console.log("✅ Order appended to Google Sheets");
}
