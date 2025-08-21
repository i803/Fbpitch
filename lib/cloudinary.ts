import { v2 as cloudinary, UploadApiResponse } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

export const uploadImage = async (file: string | Buffer, folder = "fbpitch") => {
  try {
    // Force TypeScript to understand it's a string here
    const uploadFile: string =
      Buffer.isBuffer(file)
        ? `data:image/jpeg;base64,${file.toString("base64")}`
        : String(file) // <-- ensures type is string

    const result: UploadApiResponse = await cloudinary.uploader.upload(uploadFile, {
      folder,
      resource_type: "auto",
    })

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload image")
  }
}

export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error("Failed to delete image")
  }
}
