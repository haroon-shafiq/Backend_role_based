import cloudinary from "../config/cloudinary.config.js";
import { prisma } from "../config/db.js"
export const uploadToCloudinary = async (filePath, bugID) => {
    const res = await cloudinary.uploader.upload(filePath);
    console.log("Res", res)
    const bug = await prisma.bug.update({
        where: {
            id: bugID,
        },
        data: {
            image: res.secure_url,
        }
    })
    return bug
};