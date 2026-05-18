import multer from "multer";
import { catchAsync } from "../utils/catchAsync.js";
import cloudinary from "../config/cloudinary.config.js";
import ApiError from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
})

export const upload = multer({ storage });

export const uploadToCloudinary = catchAsync(async (req, res, next) => {
    const filePath = req?.file?.path;
    if (filePath) {
        const result = await cloudinary.uploader.upload(filePath);
        if (!result) {
            throw new ApiError("Image not uploaded")
        }
        console.log("Response of cloudinary=======>>>>", result.url);
        req.body.imageURL = result.url;
    }
    next();
})