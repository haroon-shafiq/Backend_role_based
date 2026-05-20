import { prisma } from "../config/db.js";
import ApiError from "../utils/ApiError.js";

export const findDeveloperService = async ({ developerID }) => {
    const developer = await prisma.user.findUnique({
        where: { id: developerID },
        select: { id: true, role: true },
    });
    if (!developer) {
        throw new ApiError(404, "Developer not found");
    }
    if (developer?.role !== "DEVELOPER") {
        throw new ApiError(404, "Role must be a developer");
    }
    return developer;
}
export const findProjectUserService = async ({ developerID, projectID }) => {
    const projectUser = await prisma.projectUser.findUnique({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: projectID
            }
        }
    });
    if (!projectUser) {
        throw new ApiError(404, "Developer is not assigned to this project");
    }
    return projectUser;
}