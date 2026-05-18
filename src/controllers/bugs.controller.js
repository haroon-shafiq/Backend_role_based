import * as BugService from "../services/bugs.service.js";
import { sendSuccess } from "../utils/response.utils.js";
import cloudinary from "../config/cloudinary.config.js";
import { catchAsync } from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

const createBug = catchAsync(async (req, res) => {
    const { projectID } = req.params;
    const { developerID } = req.body;
    const qaID = req.user.id;
    const imageURL = req?.body?.imageURL
    const result = await BugService.createBug({ projectId: projectID, creatorId: qaID, imageURL, ...req.body });
    if (developerID && result.bug.id) {
        await BugService.assignBugToDeveloper({
            bugID: result.bug.id,
            developerID,
            qaID,
        });
    }

    return sendSuccess(res, 201, "Bug created successfully", {
        bug: result.bug,
    });
});

const updateBugs = catchAsync(async (req, res) => {
    const { bugId } = req.params;
    const data = req.body;
    const userId = req.user.id;
    const result = await BugService.updateBug({ bugId, data, userId });
    return sendSuccess(res, 200, "Update the bug successfully", result);
})

const getBug = catchAsync(async (req, res) => {
    const { projectID } = req.params;
    const developerID = req.user.id;
    const userRole = req.user.role;
    const result = await BugService.getBug({ projectID, developerID });
    return sendSuccess(res, 200, "Bugs fetched successfully", { bugs: result.bugs });
})

const assignBugToDeveloper = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const { developerID } = req.body;
    const qaID = req.user.id;
    const userRole = req.user.role;
    if (userRole !== "QA") {
        throw new ApiError(404, "Only QA can assign bugs to developers")
    }
    if (!bugID || !developerID) {
        throw new ApiError(400, "bugID and developerID are required");
    }
    const result = await BugService.assignBugToDeveloper({ bugID, developerID, qaID });
    return sendSuccess(res, 200, "Bug assigned to developer successfully", { bug: result.updatedBug });
})

const getAllBugs = catchAsync(async (req, res) => {
    const qaID = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const result = await BugService.getAllBugs(qaID, limit, page);
    return sendSuccess(res, 200, "Bugs fetched successfully", { result });
})

const getBugById = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const bug = await BugService.getBugById(bugID);
    return sendSuccess(res, 200, "Bug ggg successfully", { bug });
})

const getBugByProjectId = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const result = await BugService.getBugsByProjectId(projectId);
    return sendSuccess(res, 200, "Bug fetched successfully", { project: result.project });
})

const deleteBug = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const result = await BugService.deleteBug(bugID, req.user.id);
    return sendSuccess(res, 200, "Bug deleted successfully", { bug: result.bug });
})

const updateStatus = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const { status } = req.body;
    const result = await BugService.updateStatus(bugID, status);
    return sendSuccess(res, 200, "Status updated successfully", { bug: result.bug });
})
const getBugNotifications = catchAsync(async (req, res) => {
    console.log("User In Notifications : ", req.user);
    const notifications = await BugService.getBugNotifications(req.user.id);
    return sendSuccess(res, 200, "Notification successfully", { notifications });
})

export { createBug, updateBugs, getBug, assignBugToDeveloper, getAllBugs, getBugById, getBugByProjectId, deleteBug, updateStatus, getBugNotifications }; 