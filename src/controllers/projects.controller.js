import * as ProjectService from "../services/projects.service.js";
import { sendSuccess, sendError } from "../utils/utils.response.js";

const createProject = async (req, res) => {
    try {
        const { name, description, deadline, developerIDs } = req.body;
        const managerID = req.user.id;

        if (!name) {
            return sendError(res, 400, "Project name is required");
        }

        const result = await ProjectService.createProject({ name, description, deadline, managerID });
        console.log("Project Created==============", result.project)
        if (result.alreadyExists) {
            return sendError(res, 409, "Project already exists");
        }


        if (developerIDs?.length > 0 && result.project.id) {
            for (const developerID of developerIDs) {
                const assignResult = await ProjectService.assignDeveloperToProject({
                    managerID,
                    projectID: result.project.id,
                    developerID,
                });

                if (assignResult.notFoundDeveloper) {
                    return sendError(res, 404, `Developer ${developerID} not found`);
                }
                if (assignResult.roleNotFound) {
                    return sendError(res, 400, `User ${developerID} is not a developer`);
                }
            }
        }

        return sendSuccess(res, 201, "Project created successfully", {
            project: result.project,
        });

    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal Server Error");
    }
};

const getProject = async (req, res) => {
    const managerID = req.user.id;
    try {
        const project = await ProjectService.getProject(managerID);
        console.log("Project", project);

        return sendSuccess(res, 200, "Project fetched successfully", project);
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal Server Error");
    }
};

const assignDeveloperToProject = async (req, res) => {
    const { projectID } = req.body;
    console.log("Project ID from params", projectID);
    const { developerID } = req.body;
    console.log("Developer ID from body", developerID);
    const managerID = req.user.id;
    console.log("Manager ID from user", managerID);

    if (!projectID || !developerID) {
        return sendError(res, 400, "projectId amd developerId are required");
    }
    try {
        const result = await ProjectService.assignDeveloperToProject({
            managerID,
            projectID,
            developerID,
        });
        if (result.notFoundProject) {
            return sendError(res, 404, "Project not found");
        }
        if (result.notOwner) {
            return sendError(
                res,
                404,
                "You can only assign developers to your own created projects",
            );
        }
        if (result.notFoundDeveloper) {
            return sendError(res, 404, "Developer not found");
        }
        if (result.roleNotFound) {
            return sendError(res, 400, "Selected user is not a developer");
        }
        if (result.alreadyAssigned) {
            return sendSuccess(
                res,
                201,
                "Developer already assigned to this project",
            );
        }
        return sendSuccess(res, 201, "Developer assigned successfully", {
            projectUser: result.projectUser,
        });
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
};
const getAllProjects = async (req, res) => {
    try {
        const projects = await ProjectService.getAllProjects();
        return sendSuccess(res, 200, "Projects fetched successfully", projects);
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
}
const getProjectIdByDeveloper = async (req, res) => {
    const developerID = req.user.id;
    const role = req.user.role;
    console.log("Role from user", role);

    try {
        const projectIds = await ProjectService.getProjectIdsByDeveloper(developerID);
        console.log("Project IDs", projectIds);
        return sendSuccess(res, 200, "Project IDs fetched successfully", { projectIds });
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
};
const deleteProject = async (req, res) => {
    try {
        const { projectID } = req.params;
        console.log("Project ID", projectID);
        if (!projectID) {
            return sendError(res, 400, "Project ID is required");
        }
        const result = await ProjectService.deleteProject(projectID);
        console.log("Result in delete Project", result);
        if (result.notFoundProject) {
            return sendError(res, 404, "Project not found");
        }
        return sendSuccess(res, 200, "Project deleted successfully", { project: result.project });
    } catch (error) {
        console.log(error);
        return sendError(res, 500, "Internal server error");
    }
}


export { createProject, getProject, assignDeveloperToProject, getAllProjects, getProjectIdByDeveloper, deleteProject };
