import { prisma } from "../config/db.js";
import paginate from "../utils/paginate.js";
import ApiError from "../utils/ApiError.js";
import { bugSelect } from "../constants/selectors.js";
import { findDeveloperService, findProjectUserService } from "./users.service.js";

const findExistBug = async (bugId, title, projectId) => {
    if (bugId) {
        return await prisma.bug.findUnique({
            where: {
                id: bugId
            }
        })
    }
    else {
        const existBug = await prisma.bug.findUnique({

            where: {
                title_projectId: { title, projectId }
            }
        })
        if (existBug) {
            throw new ApiError(409, "Bug Title already exists in this project");
        }
    }
}
const createBug = async ({ title, type, status, description, imageURL, deadline, projectId, creatorId, }) => {
    await findExistBug(null, title, projectId);
    const bug = await prisma.bug.create({
        data: {
            title,
            type,
            status,
            description: description || null,
            image: imageURL || null,
            deadline: deadline ? new Date(deadline) : null,
            projectId,
            creatorId,
        },
        select: bugSelect
    });
    return { bug };
};
const updateBugService = async ({ bugID, data }) => {
    const updatedBug = await prisma.bug.update({
        where: {
            id: bugID,
        },
        data: data
    });
    console.log("Updated bug", updatedBug)
    return updatedBug;
}
const updateBug = async ({ bugId, data }) => {
    const existingBug = await findExistBug(bugId);
    if (!existingBug) {
        throw new ApiError(404, "Bug not found")
    }
    console.log("Existing bug=====", existingBug)
    const bug = await updateBugService({ bugID: bugId, data: { title: data.title, deadline: new Date(data.deadline).toISOString(), description: data.description, type: data.type, status: data.status, } })
    return { bug, existingBug };
}
const getBug = async ({ projectID, developerID }) => {
    if (!projectID) {
        throw new ApiError(400, "projectID is required")
    }
    const bugs = await prisma.bug.findMany({
        where: {
            projectId: projectID,
            developerId: developerID
        },
        select: bugSelect
    });
    if (!bugs) {
        throw new ApiError(400, "Failed to get bugs");
    }
    return { bugs };
}
const assignBugToDeveloper = async ({ bugID, developerID, qaID, }) => {
    const bug = await prisma.bug.findUnique({
        where: { id: bugID },
        select: {
            id: true,
            creatorId: true,
            projectId: true
        },
    });
    console.log("Bug created======", bug)
    if (!bug) {
        throw new ApiError(404, "Bug not found")
    }
    if (bug.creatorId !== qaID) {
        throw new ApiError(404, "You can only assign bugs you created")
    }
    await findDeveloperService({ developerID });
    await findProjectUserService({ developerID, projectID: bug.projectId });
    const updatedBug = await prisma.bug.update({
        where: { id: bugID },
        data: {
            developerId: developerID,
        },
        select: bugSelect
    });
    if (!updatedBug) {
        throw new ApiError(404, "Bug is not updated");
    }
    return { updatedBug };
};
const getAllBugs = async (userId, limit, page) => {
    return paginate({
        model: prisma.bug,
        page,
        limit,
        where: {
            creatorId: userId,
            deletedAt: null,
        },
        include: {
            assignedTo: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

}
const getBugById = async (bugID) => {


    const bug = await findExistBug(bugID);

    if (!bug) {
        throw new ApiError(404, "Bug not found")
    }
    return bug;
}
const getBugsByProjectId = async (projectId) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
        include: {
            bugs: {
                where: {
                    deletedAt: null,
                },
                include: {
                    assignedBy: { select: { id: true, name: true, role: true } },
                    assignedTo: { select: { id: true, email: true, name: true, role: true } },
                },
            },
        },
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return { project };
}

const existingBug = async (bugID) => {
    const bug = await findExistBug(bugID);
    if (!bug) {
        throw new ApiError(404, "Bug not found");
    }
    return bug;
}
const deleteBug = async (bugID) => {
    await existingBug(bugID)
    const bug = await updateBugService({ bugID, data: { deletedAt: new Date() } })
    return { bug };
}
const updateStatus = async (bugID, status) => {
    await existingBug(bugID);
    const bug = await updateBugService({ bugID, data: { status: status } });
    return { bug };
};
export { createBug, updateBug, getBug, assignBugToDeveloper, getAllBugs, getBugById, getBugsByProjectId, deleteBug, updateStatus };