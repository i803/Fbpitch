import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "fbpitch",
  api_key: "324262967733549",
  api_secret: "m_cwnhOuvi8XSKa74Ld-c3dzYAY", // Replace with your secret, never expose this in frontend
});

export async function uploadImage(filePath) {
  const res = await cloudinary.uploader.upload(filePath);
  return res.secure_url;
}
