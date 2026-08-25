import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 */
export async function uploadToCloudinary(buffer: Buffer, folder: string = "sppg_trangkil"): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto"
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        if (!result) {
          return reject(new Error("Upload failed: No result returned from Cloudinary"))
        }
        resolve(result.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

/**
 * Deletes a file from Cloudinary using its secure URL.
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<any> {
  try {
    // Extract public ID from Cloudinary URL
    // e.g. https://res.cloudinary.com/cloud_name/image/upload/v1234567890/sppg_trangkil/filename.png
    const parts = imageUrl.split("/")
    const uploadIndex = parts.indexOf("upload")
    if (uploadIndex === -1) {
      return { success: false, message: "Not a standard Cloudinary upload URL" }
    }

    // Join everything after version tag e.g. v1234567890/sppg_trangkil/filename.png
    // and extract public ID (exclude version prefix if exists like v[0-9]+)
    const publicIdWithExt = parts.slice(uploadIndex + 2).join("/") // e.g. sppg_trangkil/filename.png
    const publicId = publicIdWithExt.split(".").slice(0, -1).join(".") // e.g. sppg_trangkil/filename
    
    return await cloudinary.uploader.destroy(publicId)
  } catch (error: any) {
    console.error("Cloudinary delete failed:", error)
    return { success: false, error }
  }
}
