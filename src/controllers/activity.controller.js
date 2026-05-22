import * as ActivityService from "../services/activity.service.js";
import ApiError from "../utils/ApiError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendSuccess } from "../utils/response.utils.js";

export const getAllActivity = catchAsync(async (req, res) => {
    console.log("User In Notifications : ", req.user);
    const notifications = await ActivityService.getAllActivity(req.user.id);
    return sendSuccess(res, 200, "Notifications fetched successfully", { notifications });
})

