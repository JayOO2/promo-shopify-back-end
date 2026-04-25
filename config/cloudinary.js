import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

const requiredCloudinaryVars = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingCloudinaryVars = requiredCloudinaryVars.filter((key) => !process.env[key]);

if (missingCloudinaryVars.length > 0) {
  throw new Error(`Missing required Cloudinary environment variables: ${missingCloudinaryVars.join(", ")}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Export as default
export default cloudinary;
