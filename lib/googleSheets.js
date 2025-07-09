import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const auth = new google.auth.GoogleAuth({
  credentials: {
    // Replace escaped newlines with real newlines in the private key
    private_key: (process.env.GS_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    client_email: process.env.GS_CLIENT_EMAIL,
  },
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export async function appendOrderToSheet(orderData) {
  try {
    const spreadsheetId = process.env.GS_SHEET_ID || process.env.GS_SPREADSHEET_ID; // support both env keys

    if (!spreadsheetId) {
      throw new Error("Google Sheets spreadsheet ID is not defined in env");
    }

    const range = "Orders"; // adjust to your sheet tab and range

    const values = [
      [
        orderData.orderId,
        orderData.customer,
        orderData.amount,
        orderData.paymentMethod,
        orderData.promoCode || "",
        orderData.discountPercent || "",
        JSON.stringify(orderData.items),
        orderData.address.firstName,
        orderData.address.lastName,
        orderData.address.phone,
        orderData.address.street,
        orderData.address.city,
        orderData.address.state,
        orderData.address.postal || "",
        new Date().toLocaleString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    console.log("Order added to Google Sheets");
  } catch (error) {
    console.error("Failed to append order to Google Sheets:", error);
    throw error;
  }
}
