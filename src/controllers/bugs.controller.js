import * as BugService from "../services/bugs.service.js";
import { sendSuccess, sendError } from "../utils/utils.response.js";
import cloudinary from "../config/cloudinary.config.js";

const createBug = async (req, res) => {
    const { projectID } = req.params;
    console.log("Project ID", projectID);
    const { title, type, status, developerIDs } = req.body;
    console.log("Body", req.body)
    const userRole = req.user.role;
    const qaID = req.user.id;
    console.log("Request of file", req.file)
    const filePath = req.file?.path;
    console.log("File Path", filePath);
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
        let imageURL = null;
        if (filePath) {
            const res = await cloudinary.uploader.upload(filePath);
            console.log("Image URL", res.url);
            if (!res) {
                return res.status(400).json({ message: "Image not uploaded" })
            }
            imageURL = res.url;
        }
        const result = await BugService.createBug({ projectId: projectID, creatorId: qaID, imageURL, ...req.body });
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
const updateBugs = async (req, res) => {
    const { bugId } = req.params;
    const data = req.body;
    console.log("Bug ID:", bugId);
    if (!bugId) {
        return res.status(400).json({ success: false, message: "Bug ID is required" })
    }
    try {
        const result = await BugService.updateBug({ bugId, data });
        console.log("result", result);
        return sendSuccess(res, 200, "Update the bug successfully", result);

    } catch (error) {
        console.error("Error", error)
        return res.status(500).json({ success: false, message: error.message })
    }

}

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
const getBugById = async (req, res) => {
    const { bugID } = req.params;

    if (!bugID) {
        return sendError(res, 400, "bugID is required");
    }
    try {
        const bug = await BugService.getBugById(bugID);
        return sendSuccess(res, 200, "Bug fetched successfully", { bug });
    } catch (error) {
        console.error(error);
        return sendError(res, 500, "Internal server error");
    }
}
export { createBug, updateBugs, getBug, assignBugToDeveloper, getAllBugs, getBugById }; 