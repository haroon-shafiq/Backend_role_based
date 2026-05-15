import { prisma } from "../config/db.js";
import paginate from "../utils/paginate.js";
import { generateInviteToken } from "../utils/token.utils.js";
import { sendInvitationEmail } from "./email.service.js";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const createProject = async ({ name, description, deadline, managerID }) => {

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
        throw new ApiError(res, 409, "Project already exists");
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
const assignDeveloperToProject = async ({ managerID, projectID, developerID }) => {
    console.log("Project ID", projectID)
    const project = await prisma.project.findUnique({
        where: {
            id: projectID,
        },
        include: {
            manager: {
                select: {
                    name: true,
                },
            },
        },

    });
    console.log("Project", project);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    if (project.managerID !== managerID) {
        throw new ApiError(403, "You can only assign developers to your own created projects");
    }
    const developer = await prisma.user.findUnique({
        where: {
            id: developerID,
        },
    });
    if (!developer) {
        throw new ApiError(404, `Developer not found)`)
    }
    if (developer.role !== "DEVELOPER") {
        throw new ApiError(400, `User  is not a developer`)
    }
    const alreadyAssigned = await prisma.projectUser.findUnique({
        where: {
            userId_projectId: {
                userId: developerID,
                projectId: projectID,
            },
        },
    });

    if (alreadyAssigned) {
        throw new ApiError(400, "Developer already assigned to this project")
    }

    const responseOfGenerateToken = generateInviteToken({ developerID, projectID })
    console.log("Response of token for invitation", responseOfGenerateToken);

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
    const acceptInviationLink = `${env.BASE_URL}/inviteAccept?token=${responseOfGenerateToken.token}`;

    await prisma.invitation.create({
        data: {
            inviteToken: responseOfGenerateToken.token,
            inviteExpiry: responseOfGenerateToken.expiry,
            invitedById: managerID,
            projectId: projectID,
            invitedUserId: developerID,
        },
    });
    console.log("Accept Invitation Link", acceptInviationLink);
    await sendInvitationEmail({
        to: developer.email,
        developerName: developer.name,
        projectName: project.name,
        managerName: project.manager.name,
        acceptLink: acceptInviationLink,
    });

    return { projectUser };
}
export const acceptInvite = async ({ developerID, projectID, token }) => {

    const invitation = await prisma.invitation.findUnique({
        where: {
            inviteToken: token
        }
    });
    if (!invitation) {
        const acceptedInvitation = await prisma.invitation.findFirst({
            where: {
                invitedUserId: developerID,
                projectId: projectID,
                acceptInvite: true,
                inviteToken: null,
            },
        });

        if (acceptedInvitation) {
            throw new ApiError(200, "Invite already accepted")
        }
        return { invalidInvite: true };
    }
    console.log("Invitation", invitation);
    if (invitation.invitedUserId !== developerID || invitation.projectId !== projectID) {
        throw new ApiError(400, "Invalid Invite")
    };

    if (invitation.acceptInvite) {
        throw new ApiError(200, "Invite already accepted")
    };
    if (invitation.inviteExpiry < new Date()) {
        throw new ApiError(400, "Invite expired")
    };

    await prisma.invitation.update({
        where: { inviteToken: token },
        data: {
            acceptInvite: true,
            inviteToken: null,
        },
    });


    const updatedProjectUser = await prisma.projectUser.update({
        where: {
            userId_projectId: {
                userId: invitation.invitedUserId,
                projectId: invitation.projectId,
            },
        },
        data: {
            acceptInvite: true,
        },
    });

    return { projectUser: updatedProjectUser };
};

// export const acceptInvite = async ({ developerID, projectID, token }) => {
//     const projectUser = await prisma.projectUser.findUnique({
//         where: {
//             userId_projectId: {
//                 userId: developerID,
//                 projectId: projectID,
//             }
//         }
//     })
//     console.log("Project User", projectUser);
//     if (!projectUser) {
//         return { notFoundProjectUser: true }
//     }
//     if (projectUser.acceptInvite && !projectUser.inviteToken) {
//         return { alreadyAccepted: true }
//     }
//     if (!projectUser.inviteToken || !projectUser.inviteExpiry) {
//         return { invalidInvite: true }
//     }
//     if (projectUser.inviteToken != token) {
//         return { invalidInvite: true }
//     }
//     if (projectUser.inviteExpiry < new Date()) {
//         return { expiredInvite: true }
//     }

//     const updatedProjectUser = await prisma.projectUser.update({
//         where: {
//             userId_projectId: {
//                 userId: developerID,
//                 projectId: projectID
//             }
//         },
//         data: {
//             acceptInvite: true,
//             inviteToken: null,
//         },
//     });
//     console.log("Updated Project User", projectUser);
//     return { projectUser: updatedProjectUser };


// }



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
            projectUsers: {
                select: {
                    acceptInvite: true
                }
            }
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
            projectUsers: {
                select: {
                    acceptInvite: true
                }
            }
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
        throw new ApiError(404, "Project not found");
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