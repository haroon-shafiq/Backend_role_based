import { prisma } from "../config/db.js";
import { userSelect } from "../constants/selectors.js";
import { BugFieldsToTrack } from "../constants/BugFields.js"

const updateBugActivities = {
    changedFields: [],
    oldValues: [],
    newValues: [],
}


export const getAllActivity = async (userId) => {
    const notifications = await prisma.activity.findMany({
        where: {
            actorUserId: userId,
        },
        include: {
            assignedToUser: {
                select: userSelect
            },
        }
    })
    console.log("User notification=======>>>>>>>", notifications)
    return { notifications };
}
export const createActivityService = async (action, entityType, entityId, entityTitle, actorUserId, assignedToUserId, existingBug, bug) => {
    console.log("Creating Activity: ", action, entityType, entityId, entityTitle, actorUserId)
    const base = {
        action,
        entityType,
        entityId,
        entityTitle,
        actorUserId,
        assignedToUserId
    }
    if (!existingBug && !bug) {
        const notification = await prisma.activity.create({
            data: base
        })
        return { notification }
    }
    BugFieldsToTrack.forEach(field => {
        if (String(existingBug[field]) !== String(bug[field])) {
            updateBugActivities.changedFields.push(field);
            updateBugActivities.oldValues.push(String(existingBug[field]));
            updateBugActivities.newValues.push(String(bug[field]));
        }
    });

    const notification = await prisma.activity.create({
        data: {
            ...base,
            changedFields: updateBugActivities.changedFields,
            oldValues: updateBugActivities.oldValues,
            newValues: updateBugActivities.newValues,
        }
    })
    return { notification };
}


