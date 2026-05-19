import { prisma } from "../config/db.js";
import paginate from "../utils/paginate.js";
import ApiError from "../utils/ApiError.js";
import { notificationsSelector } from "../constants/notificationSelectors.js";

const createBug = async ({
    title,
    type,
    status,
    description,
    imageURL,
    deadline,
    projectId,
    creatorId,
}) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true },
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const existTitle = await prisma.bug.findFirst({
        where: {
            title,
            projectId,
            creatorId,
        },
    });

    if (existTitle) {
        throw new ApiError(409, "Bug title already exists in this project")
    }

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
        select: {
            id: true,
            title: true,
            type: true,
            status: true,
            description: true,
            image: true,
            deadline: true,
            projectId: true,
            creatorId: true,
            createdAt: true,
        },
    });
    // await prisma.activity.create({
    //     data: notificationsSelector("Bug Created", "BUG", bug.id, bug.title, creatorId)
    // })
    return { bug };
};
const updateBug = async ({ bugId, data }) => {
    const existingBug = await prisma.bug.findUnique({
        where: {
            id: bugId
        }
    })


    const bug = await prisma.bug.update({
        where: {
            id: bugId
        },
        data: {
            title: data.title,
            deadline: new Date(data.deadline).toISOString(),
            description: data.description,
            type: data.type,
            status: data.status,
        }

    })


    // await prisma.activity.create({
    //     data: {
    //         ...notificationsSelector("Bug Updated", "BUG", bugId, bug.title, userId, existingBug, bug),
    //     }
    // })
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
        select: {
            id: true,
            title: true,
            type: true,
            status: true,
            description: true,
            image: true,
            deadline: true,
            projectId: true,
            creatorId: true,
            developerId: true,
            createdAt: true,
        },
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

    if (!bug) {
        throw new ApiError(404, "Bug not found")
    }

    if (bug.creatorId !== qaID) {
        throw new ApiError(404, "You can only assign bugs you created")
    }

    const developer = await prisma.user.findUnique({
        where: { id: developerID },
        select: { id: true, role: true },
    });

    if (!developer) {
        throw new ApiError(404, "Developer not found");
    }

    if (developer?.role !== "DEVELOPER") {
        throw new ApiError(404, "Role must be a developer")
    }

    const projectUser = await prisma.projectUser.findUnique({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: bug.projectId,
            },
        },
    });
    if (!projectUser) {
        throw new ApiError(404, "Developer is not assigned to the project of this bug")
    }
    const updatedBug = await prisma.bug.update({
        where: { id: bugID },
        data: {
            developerId: developerID,
        },
        select: {
            id: true,
            title: true,
            type: true,
            status: true,
            projectId: true,
            creatorId: true,
            developerId: true,
            updatedAt: true,
        },
    });
    if (!updatedBug) {
        throw new ApiError(404, "Bug is not updated");
    }
    // await prisma.activity.create({
    //     data: {
    //         ...notificationsSelector("Bug Assigned", "BUG", updatedBug.id, updatedBug.title, qaID),
    //         assignedToUserId: developerID,
    //     }
    // })
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

    // const bugs = await prisma.bug.findMany({
    //     where: {
    //         creatorId: userId,
    //         deletedAt: null,
    //     },
    //     include: {
    //         assignedTo: {
    //             select: {
    //                 id: true,
    //                 name: true
    //             }
    //         }
    //     }

    // })

    // console.log("Bugs", bugs);

}
const getBugById = async (bugID) => {

    if (!bugID) {
        throw new ApiError(400, "bugID is required");
    }
    const bug = await prisma.bug.findUnique({
        where: { id: bugID },
        select: {
            id: true,
            title: true,
            type: true,
            status: true,
            description: true,
            image: true,
            deadline: true,
            projectId: true,
            creatorId: true,
            developerId: true,
            createdAt: true,
        },
    })
    if (!bug) {
        return { notFoundBug: true };
    }
    return bug;
}
const getBugsByProjectId = async (projectId) => {
    if (!projectId) {
        throw ApiError(400, "Project ID is required");
    }
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
const deleteBug = async (bugID, creatorId) => {
    if (!bugID) {
        throw new ApiError(400, "bugID is required");
    }
    const existingBug = await prisma.bug.findUnique({
        where: {
            id: bugID,

        },
    });
    if (!existingBug) {
        throw new ApiError(404, "Bug not found");
    }

    const bug = await prisma.bug.update({
        where: {
            id: bugID,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    // await prisma.activity.create({
    //     data: notificationsSelector("Bug Deleted", "BUG", bugID, existingBug.title, creatorId)
    // })
    return { bug };
}
const updateStatus = async (bugID, status) => {
    if (!bugID || !status) {
        throw new ApiError(400, "bugID and status are required");
    }

    const existingBug = await prisma.bug.findUnique({
        where: {
            id: bugID,
        },
    });

    if (!existingBug) {
        throw new ApiError(404, "Bug not found");
    }

    const bug = await prisma.bug.update({
        where: {
            id: bugID,
        },
        data: {
            status: status,
        },
    });


    return { bug };
};

export { createBug, updateBug, getBug, assignBugToDeveloper, getAllBugs, getBugById, getBugsByProjectId, deleteBug, updateStatus };
