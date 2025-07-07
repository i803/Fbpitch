import { Resend } from "resend";
import { connectToDB } from "../../../lib/mongoose";
import ContactMessage from "../../../models/ContactMessage";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Connect to DB
    await connectToDB();

    // Save message to MongoDB
    const contact = new ContactMessage({ name, email, message });
    await contact.save();

    // Send email notification
    const data = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: "darendcunha@gmail.com",
      subject: "New Contact Form Submission",
      html: `
        <h2>New Message from Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
