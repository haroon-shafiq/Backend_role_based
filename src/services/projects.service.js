import { prisma } from "../config/db.js";
import paginate from "../utils/paginate.js";
import { generateInviteToken } from "../utils/token.utils.js";
import { sendInvitationEmail } from "./email.service.js";
import { env } from "../config/env.js";

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
const getProject = async (managerID, page, limit) => {
    return paginate({
        model: prisma.project,
        page,
        limit,
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
    })
    // const projects = await prisma.project.findMany({
    //     where: {
    //         managerID,
    //         deletedAt: null,
    //     },
    //     include: {
    //         projectUsers: {
    //             include: {
    //                 user: {
    //                     select: {
    //                         id: true,
    //                         name: true,
    //                         email: true,
    //                         role: true,
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // });

    // return { projects };
}
const assignDeveloperToProject = async ({ managerID, projectID, developerID, role }) => {
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

    const responseOfGenerateToken = generateInviteToken({ developerID, projectID, role })
    console.log("Response of token for invitation", responseOfGenerateToken);

    const projectUser = await prisma.projectUser.create({
        data: {
            userId: developerID,
            projectId: projectID,
            inviteToken: responseOfGenerateToken.token,
            inviteExpiry: responseOfGenerateToken.expiry,
        },
        select: {
            id: true,
            projectId: true,
            userId: true,
        },
    });
    const acceptInviationLink = `${env.BASE_URL}/inviteAccept?token=${responseOfGenerateToken.token}`;
    console.log("Accept Invitation Link", acceptInviationLink);
    await sendInvitationEmail({
        to: developer.email,
        developerName: developer.name,
        projectName: project.name,
        acceptLink: acceptInviationLink,
    });

    return { projectUser };
}
export const acceptInvite = async ({ developerID, projectID, token }) => {
    const projectUser = await prisma.projectUser.findUnique({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: projectID,
            }
        }
    })
    console.log("Project User", projectUser);
    if (!projectUser) {
        return { notFoundProjectUser: true }
    }
    if (projectUser.acceptInvite && !projectUser.inviteToken) {
        return { alreadyAccepted: true }
    }
    if (!projectUser.inviteToken || !projectUser.inviteExpiry) {
        return { invalidInvite: true }
    }
    if (projectUser.inviteToken != token) {
        return { invalidInvite: true }
    }
    if (projectUser.inviteExpiry < new Date()) {
        return { expiredInvite: true }
    }

    const updatedProjectUser = await prisma.projectUser.update({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: projectID
            }
        },
        data: {
            acceptInvite: true,
            inviteToken: null,
        },
    });
    console.log("Updated Project User", projectUser);
    return { projectUser: updatedProjectUser };


}



const getAllProjects = async (page, limit) => {

    return paginate({
        model: prisma.project,
        page,
        limit,
        where: {
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            description: true,
            deadline: true,

            manager: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
    });
};
const getProjectIdsByDeveloper = async (developerID, page, limit) => {
    return paginate({
        model: prisma.project,
        page,
        limit,
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

    })

    // const projects = await prisma.project.findMany({
    //     where: {
    //         deletedAt: null,
    //         projectUsers: {
    //             some: { userId: developerID },

    //         },

    //     },
    //     include: {
    //         manager: {
    //             select: { id: true, name: true, role: true },
    //         },

    //         bugs: {
    //             where: {
    //                 deletedAt: null,
    //             },
    //             include: {
    //                 assignedBy: { select: { id: true, name: true, role: true } },
    //                 assignedTo: { select: { id: true, email: true, name: true, role: true } },
    //             },
    //         },
    //     },
    //     orderBy: { createdAt: "desc" },
    // });

    // return projects;
};

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

export { createProject, getProject, assignDeveloperToProject, getAllProjects, getProjectIdsByDeveloper, deleteProject };