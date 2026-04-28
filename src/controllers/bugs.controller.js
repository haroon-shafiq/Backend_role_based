import * as BugService from "../services/bugs.service.js";
import { sendSuccess, sendError } from "../utils/utils.response.js";

const createBug = async (req, res) => {
    const { projectID } = req.params;
    console.log("Project ID", projectID);
    const { title, type, status, developerIDs } = req.body;
    const userRole = req.user.role;
    const qaID = req.user.id;
    if (userRole !== "QA") {
        return sendError(res, 403, "Only QA can create bugs");
    }

    if (!projectID) {
        return sendError(res, 400, "projectID is required");
    }

    if (!title || !type || !status) {
        return sendError(res, 400, "title, type and status are required");
    }

    const validType = ["BUG", "FEATURE"];
    if (!validType.includes(type)) {
        return sendError(res, 400, "type must be BUG or FEATURE");
    }

    const validStatus = ["NEW", "STARTED", "RESOLVED", "COMPLETED"];
    if (!validStatus.includes(status)) {
        return sendError(
            res,
            400,
            "status must be NEW, STARTED, RESOLVED or COMPLETED",
        );
    }

    try {
        const result = await BugService.createBug({ projectId: projectID, creatorId: qaID, ...req.body });
        console.log("Result===================", result.bug)
        if (developerIDs?.length > 0 && result.bug.id) {
            for (const developerID of developerIDs) {
                const assignResult = await BugService.assignBugToDeveloper({
                    bugID: result.bug.id,
                    developerID: developerID,
                    qaID: qaID,
                });
                if (assignResult.notFoundDeveloper) {
                    return sendError(res, 404, "Developer not found");
                }
                if (assignResult.notBugCreatedByQA) {
                    return sendError(res, 404, "You can only assign bugs you created");
                }
                if (assignResult.notFoundRole) {
                    return sendError(res, 404, "User is not a QA");
                }
                if (assignResult.developerNotInProject) {
                    return sendError(res, 404, "Developer is not assigned to the project of this bug");
                }
                if (assignResult.notUpdated) {
                    return sendError(res, 404, "Bug is not updated");
                }

            }
        }
        if (result.notFoundProject) {
            return sendError(res, 404, "Project not found");
        }
        console.log("Exist Title", result.existTitle);
        if (result.existTitle) {
            return sendError(res, 409, "Bug title already exists in this project");
        }

        return sendSuccess(res, 201, "Bug created successfully", {
            bug: result.bug,
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
};

const getBug = async (req, res) => {
    const { projectID } = req.params;
    const developerID = req.user.id;
    const userRole = req.user.role;
    if (userRole !== "DEVELOPER") {
        return sendError(res, 404, "Only Developer can view bugs");
    }
    if (!projectID) {
        return sendError(res, 400, "projectID is required");
    }
    try {
        const result = await BugService.getBug({ projectID, developerID });
        if (result.notFoundProject) {
            return sendError(res, 404, "Project not found");
        }
        if (result.notFoundDeveloper) {
            return sendError(res, 404, "Developer not found");
        }
        if (result.developerNotInProject) {
            return sendError(res, 404, "Developer is not assigned to the project of this bug");
        }
        return sendSuccess(res, 200, "Bugs fetched successfully", { bugs: result.bugs });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
const assignBugToDeveloper = async (req, res) => {
    const { bugID } = req.params;
    const { developerID } = req.body;
    const qaID = req.user.id;
    const userRole = req.user.role;
    console.log("Bug ID", bugID);
    console.log("Developer ID", developerID);
    console.log("QA ID", qaID);
    if (userRole !== "QA") {
        return sendError(res, 404, "Only QA can assign bugs to developers");
    }
    if (!bugID || !developerID) {
        return sendError(res, 400, "bugID and developerID are required");
    }
    try {

        const result = await BugService.assignBugToDeveloper({ bugID, developerID, qaID });
        if (result.notFoundBug) {
            return sendError(res, 404, "Bug not found");
        }
        if (result.notBugCreatedByQA) {
            return sendError(res, 404, "You can only assign bugs you created");
        }
        if (result.notFoundDeveloper) {
            return sendError(res, 404, "Developer not found");
        }
        if (result.notFoundRole) {
            return sendError(res, 404, "User is not a QA");
        }
        if (result.developerNotInProject) {
            return sendError(res, 404, "Developer is not assigned to the project of this bug");
        }
        return sendSuccess(res, 200, "Bug assigned to developer successfully", { bug: result.updatedBug });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
const getAllBugs = async (req, res) => {
    const qaID = req.user.id;
    console.log("QA ID", qaID);
    try {
        const bugs = await BugService.getAllBugs(qaID);
        return sendSuccess(res, 200, "Bugs fetched successfully", { bugs });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
export { createBug, getBug, assignBugToDeveloper, getAllBugs }; 