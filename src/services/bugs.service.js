import { prisma } from "../config/db.js";

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
        return { notFoundProject: true };
    }
    const existTitle = await prisma.bug.findFirst({
        where: {
            title,
            projectId,
            creatorId,
        },
    });
    if (existTitle) {
        return { existTitle: true };
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

    return { bug };
};
const updateBug = async ({ bugId, data }) => {
    console.log("Bug ID in Service", bugId)
    console.log("Data in Service", data)
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
    console.log("Bug", bug)

    return bug;
}
const getBug = async ({ projectID, developerID }) => {
    const project = await prisma.project.findUnique({
        where: { id: projectID },
        select: { id: true },
    });
    if (!project) {
        return { notFoundProject: true };
    }
    const developer = await prisma.user.findUnique({
        where: { id: developerID },
        select: { id: true, role: true },
    });
    if (!developer) {
        return { notFoundDeveloper: true };
    }
    if (developer.role !== "DEVELOPER") {
        return { notFoundRole: true };
    }
    const projectUser = await prisma.projectUser.findUnique({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: projectID,
            },
        },
    });
    if (!projectUser) {
        return { developerNotInProject: true };
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
        return { notFoundBug: true };
    }

    if (bug.creatorId !== qaID) {
        return { notBugCreatedByQA: true };
    }

    const developer = await prisma.user.findUnique({
        where: { id: developerID },
        select: { id: true, role: true },
    });

    if (!developer) {
        return { notFoundDeveloper: true };
    }

    if (developer.role !== "DEVELOPER") {
        return { notFoundRole: true };
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
        return { developerNotInProject: true };
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
    console.log("Updated Bug", updatedBug);
    if (!updatedBug) {
        return { notUpdated: true };
    }

    return { updatedBug };
};
const getAllBugs = async (userId) => {
    const bugs = await prisma.bug.findMany({
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
    // console.log("Bugs", bugs);
    return bugs;
}
const getBugById = async (bugID) => {
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
const deleteBug = async (bugID) => {
    console.log("Bug ID in Service", bugID);
    const existingBug = await prisma.bug.findUnique({
        where: {
            id: bugID,

        },
    });
    if (!existingBug) {
        return { notFoundBug: true };
    }
    const bug = await prisma.bug.update({
        where: {
            id: bugID,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return { bug };
}
const updateStatus = async (bugID, status) => {
    const existingBug = await prisma.bug.findUnique({
        where: {
            id: bugID,

        },
    });
    if (!existingBug) {
        return { notFoundBug: true };
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
}

export { createBug, updateBug, getBug, assignBugToDeveloper, getAllBugs, getBugById, deleteBug, updateStatus };
