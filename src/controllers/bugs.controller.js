import * as BugService from "../services/bugs.service.js";
import { sendSuccess } from "../utils/response.utils.js";
import cloudinary from "../config/cloudinary.config.js";
import { BUG_STATUS, BUG_TYPE } from "../constants/enums.js";
import { catchAsync } from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";

const createBug = catchAsync(async (req, res) => {
    const { projectID } = req.params;
    const { status, developerIDs, type } = req.body;
    const userRole = req.user.role;
    const qaID = req.user.id;
    const filePath = req.file?.path;
    if (userRole !== "QA") {
        throw new ApiError(403, "Only QA can create bugs");
    }
    if (!projectID) {
        throw new ApiError(400, "projectID is required");
    }

    if (!BUG_TYPE.includes(type)) {
        throw new ApiError(400, "type must be BUG or FEATURE");
    }
    if (!BUG_STATUS.includes(status)) {
        throw new ApiError(400, "status must be NEW, STARTED, RESOLVED or COMPLETED");
    }
    let imageURL = null;
    if (filePath) {
        const res = await cloudinary.uploader.upload(filePath);
        if (!res) {
            throw new ApiError(400, "Image not uploaded");
        }
        imageURL = res.url;
    }
    const result = await BugService.createBug({ projectId: projectID, creatorId: qaID, imageURL, ...req.body });
    if (developerIDs?.length > 0 && result.bug.id) {
        for (const developerID of developerIDs) {
            await BugService.assignBugToDeveloper({
                bugID: result.bug.id,
                developerID: developerID,
                qaID: qaID,
            });
        }
    }
    return sendSuccess(res, 201, "Bug created successfully", {
        bug: result.bug,
    });
});

const updateBugs = catchAsync(async (req, res) => {
    const { bugId } = req.params;
    const data = req.body;
    const result = await BugService.updateBug({ bugId, data });
    return sendSuccess(res, 200, "Update the bug successfully", result);
})

const getBug = catchAsync(async (req, res) => {
    const { projectID } = req.params;
    const developerID = req.user.id;
    const userRole = req.user.role;
    if (userRole !== "DEVELOPER") {
        throw new ApiError(404, "Only Developer can view bugs")
    }
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
    return sendSuccess(res, 200, "Bug fetched successfully", { bug });
})

const getBugByProjectId = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const result = await BugService.getBugsByProjectId(projectId);
    return sendSuccess(res, 200, "Bug fetched successfully", { project: result.project });
})

const deleteBug = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const result = await BugService.deleteBug(bugID);
    return sendSuccess(res, 200, "Bug deleted successfully", { bug: result.bug });
})

const updateStatus = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const { status } = req.body;
    const result = await BugService.updateStatus(bugID, status);
    return sendSuccess(res, 200, "Status updated successfully", { bug: result.bug });
})

export { createBug, updateBugs, getBug, assignBugToDeveloper, getAllBugs, getBugById, getBugByProjectId, deleteBug, updateStatus }; 