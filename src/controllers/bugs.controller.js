import * as BugService from "../services/bugs.service.js";
import { sendSuccess } from "../utils/response.utils.js";
import { catchAsync } from "../utils/catchAsync.js";
import { BugActivityActionType, BugActivityEntityType } from "../constants/BugFields.js";
import ApiError from "../utils/ApiError.js";
import * as activityService from "../services/activity.service.js";

const createBug = catchAsync(async (req, res) => {
    const { projectID } = req.params;
    const { developerID } = req.body;
    const qaID = req.user.id;
    const imageURL = req?.body?.imageURL
    const result = await BugService.createBug({ projectId: projectID, creatorId: qaID, imageURL, ...req.body });
    console.log("@@@@@@@@@@@@@@@ Result", result);
    await activityService.createActivityService(BugActivityActionType.CREATED, BugActivityEntityType.BUG, result.bug.id, result.bug.title, qaID);

    if (developerID && result.bug.id) {
        const bug = await BugService.assignBugToDeveloper({
            bugID: result.bug.id,
            developerID,
            qaID,
        });
        console.log("@@@@@@@@@@@@@@@ Bug", bug);
        await activityService.createActivityService(BugActivityActionType.ASSIGNED, BugActivityEntityType.BUG, bug.updatedBug.id, bug.updatedBug.title, qaID, bug.updatedBug.developerId);
    }

    return sendSuccess(res, 201, "Bug created successfully", {
        bug: result.bug,
    });
});

const updateBugs = catchAsync(async (req, res) => {
    const { bugId } = req.params;
    const data = req.body;
    const userId = req.user.id;
    const { existingBug, bug } = await BugService.updateBug({ bugId, data, userId });

    console.log("Bug++++++", existingBug)
    await activityService.createActivityService(BugActivityActionType.UPDATED, BugActivityEntityType.BUG, bug.id, bug.title, userId, bug.developerId, existingBug, bug);
    return sendSuccess(res, 200, "Update the bug successfully", bug);
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
    console.log("@++++++++Result", result);
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
    await activityService.createActivityService(BugActivityActionType.DELETED, BugActivityEntityType.BUG, result.bug.id, result.bug.title, req.user.id);
    return sendSuccess(res, 200, "Bug deleted successfully", { bug: result.bug });
})

const updateStatus = catchAsync(async (req, res) => {
    const { bugID } = req.params;
    const { status } = req.body;
    const result = await BugService.updateStatus(bugID, status);
    return sendSuccess(res, 200, "Status updated successfully", { bug: result.bug });
})


export { createBug, updateBugs, getBug, assignBugToDeveloper, getAllBugs, getBugById, getBugByProjectId, deleteBug, updateStatus }; 