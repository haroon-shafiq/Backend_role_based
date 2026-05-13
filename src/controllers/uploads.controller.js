import * as UploadService from "../services/uploads.service.js"
import { sendSuccess } from "../utils/response.utils.js";

export const uploadImage = async (req, res) => {
    const { bugID } = req.params;
    console.log("Bug ID", bugID);
    try {
        console.log("File is ", req.file)
        const result = await UploadService.uploadToCloudinary(req.file.path, bugID);
        sendSuccess(res, 201, "Uploaded successfully", {
            result
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};