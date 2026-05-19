import * as ProjectService from "../services/projects.service.js";
import * as ActivityService from "../services/activity.service.js";
import { sendSuccess } from "../utils/response.utils.js";
import { decodeInviteToken } from "../utils/token.utils.js";
import { catchAsync } from "../utils/catchAsync.js";
import ApiError from "../utils/ApiError.js";
import { ProjectActivityActionType, ProjectActivityEntityType } from "../constants/BugFields.js";

const createProject = catchAsync(async (req, res) => {
    const { name, description, deadline, developerIDs } = req.body;
    console.log("++++++++++??>>>>>>>>>>> Developer ID", developerIDs)
    const managerID = req.user.id;

    const result = await ProjectService.createProject({ name, description, deadline, managerID });
    await ActivityService.createActivityService(ProjectActivityActionType.CREATED, ProjectActivityEntityType.PROJECT, result.project.id, result.project.name, managerID);
    if (developerIDs?.length > 0 && result.project.id) {
        for (const developerID of developerIDs) {
            await ProjectService.assignDeveloperToProject({
                managerID,
                projectID: result.project.id,
                developerID,
                createActivity: true
            });
        }



    }

    return sendSuccess(res, 201, "Project created successfully", {
        project: result.project,
    });
});

const acceptInvite = catchAsync(async (req, res) => {
    const { token } = req.query;
    const userId = req.user.id;

    if (!token) {
        throw new ApiError(400, "nvitation Token is required")
    }

    const { payload, expired, invalid } = decodeInviteToken(token);
    if (invalid) {
        throw new ApiError(400, "Invalid Invite Token")
    }
    if (expired) {
        throw new ApiError(400, "Expired Invite Token")
    }
    const { developerID, projectID } = payload;
    if (developerID !== userId) {
        throw new ApiError(res, 403, "You are not authorized to accept this invite")
    }

    const result = await ProjectService.acceptInvite({ developerID, projectID, token });


    return sendSuccess(res, 200, "Invite accepted successfully", { projectUser: result.projectUser })
});

const getProject = catchAsync(async (req, res) => {
    const managerID = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const project = await ProjectService.getProject(managerID, page, limit);
    return sendSuccess(res, 200, "Project fetched successfully", project);
});

const assignDeveloperToProject = catchAsync(async (req, res) => {
    const managerID = req.user.id;
    const result = await ProjectService.assignDeveloperToProject({
        managerID,
        ...req.body,
        role: req.user.role
    });
    return sendSuccess(res, 201, "Developer assigned successfully", {
        projectUser: result.projectUser,
    });
});

const getAllProjects = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const projects = await ProjectService.getAllProjects(page, limit);
    return sendSuccess(res, 200, "Projects fetched successfully", { projects });
})

const getProjectIdByDeveloper = catchAsync(async (req, res) => {
    const developerID = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const projectIds = await ProjectService.getProjectIdsByDeveloper(developerID, page, limit);
    return sendSuccess(res, 200, "Project IDs fetched successfully", { projectIds });
})

const deleteProject = catchAsync(async (req, res) => {
    const { projectID } = req.params;
    if (!projectID) {
        throw new ApiError(400, "Project ID is required");
    }
    const result = await ProjectService.deleteProject(projectID);
    await ActivityService.createActivityService(ProjectActivityActionType.DELETED, ProjectActivityEntityType.PROJECT, result.project.id, result.project.name, req.user.id);
    return sendSuccess(res, 200, "Project deleted successfully", { project: result.project });
})

export { createProject, acceptInvite, getProject, assignDeveloperToProject, getAllProjects, getProjectIdByDeveloper, deleteProject };
