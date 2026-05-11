import { prisma } from "../config/db.js";
const createProject = async ({ name, description, deadline, managerID }) => {
    console.log("Manager ID", managerID);
    console.log("Project Name", name);
    console.log("Description", description);
    console.log("Deadline", deadline);

    const existingProject = await prisma.project.findFirst({
        where: {
            name,
            managerID,
        },
        select: {
            name: true,
        },
    });

    if (existingProject) {
        return {
            alreadyExists: true,
        };
    }

    const project = await prisma.project.create({
        data: {
            name,
            description,
            deadline: deadline ? new Date(deadline) : null,
            managerID
        },
        select: {
            id: true,
            name: true,
            description: true,
            deadline: true,
            managerID: true,
            createdAt: true,
        },

    });


    return { project };
}
const getProject = async (managerID) => {
    const projects = await prisma.project.findMany({
        where: {
            managerID,
            deletedAt: null,
        },
        include: {
            projectUsers: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    }
                }
            }
        }
    });

    return { projects };
}
const assignDeveloperToProject = async ({ managerID, projectID, developerID }) => {
    console.log("Project ID", projectID)
    const project = await prisma.project.findUnique({
        where: {
            id: projectID,
        },

    });
    console.log("Project", project);
    if (!project) {
        return { notFoundProject: true };
    }
    if (project.managerID !== managerID) {
        return { notOwner: true };
    }
    const developer = await prisma.user.findUnique({
        where: {
            id: developerID,
        },
    });
    if (!developer) {
        return { notFoundDeveloper: true };
    }
    if (developer.role !== "DEVELOPER") {
        return { roleNotFound: true };
    }
    const alreadyAssigned = await prisma.projectUser.findUnique({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: projectID,
            },
        },
    });
    console.log("Already Assigned", alreadyAssigned);
    if (alreadyAssigned) {
        return { alreadyAssigned: true };
    }
    const projectUser = await prisma.projectUser.create({
        data: {
            userId: developerID,
            projectId: projectID,
        },
        select: {
            id: true,
            projectId: true,
            userId: true,
        },
    });
    return { projectUser };
}
const getAllProjects = async () => {
    const projects = await prisma.project.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            deadline: true,
            manager: {
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            }
        }
    });

    return { projects };
};
const getProjectIdsByDeveloper = async (developerID) => {
    const projects = await prisma.project.findMany({
        where: {
            deletedAt: null,
            projectUsers: {
                some: { userId: developerID },

            },

        },
        include: {
            manager: {
                select: { id: true, name: true, role: true },
            },

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
        orderBy: { createdAt: "desc" },
    });

    return projects;
};
const getBugsByProjectId = async (projectID) => {
    const projects = await prisma.project.findUnique({
        where: {
            id: projectID,
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
    return projects;
}
const deleteProject = async (projectID) => {
    console.log("Project ID", projectID);
    const existingProject = await prisma.project.findUnique({
        where: {
            id: projectID,
        },
    });
    if (!existingProject) {
        return { notFoundProject: true };
    }

    const project = await prisma.project.update({
        where: {
            id: projectID,
        },
        data: {
            deletedAt: new Date(),
        },
    });
    return { project };
}

export { createProject, getProject, assignDeveloperToProject, getAllProjects, getProjectIdsByDeveloper, getBugsByProjectId, deleteProject };