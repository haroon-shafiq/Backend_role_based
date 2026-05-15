import * as UploadService from "../services/uploads.service.js"
import { sendSuccess } from "../utils/response.utils.js";
import { catchAsync } from "../utils/catchAsync.js";

export const uploadImage = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const result = await UploadService.uploadToCloudinary(req.file.path, bugID);
    sendSuccess(res, 201, "Uploaded successfully", {
        result
    });
});