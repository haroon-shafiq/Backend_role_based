import { BugFieldsToTrack } from "../constants/BugFields.js"
export const notificationsSelector = (action, entityType, entityId, entityTitle, actorUserId, existingBug, bug) => {

    const baseNotification = {
        action,
        entityType,
        entityId,
        entityTitle,
        actorUserId,
    };

    const updateBugActivities = {
        changedFields: [],
        oldValues: [],
        newValues: [],
    }

    if (!existingBug && !bug) return baseNotification;

    BugFieldsToTrack.forEach(field => {
        if (String(existingBug[field]) !== String(bug[field])) {
            updateBugActivities.changedFields.push(field);
            updateBugActivities.oldValues.push(String(existingBug[field]));
            updateBugActivities.newValues.push(String(bug[field]));
        }
    });



    return {
        ...baseNotification,
        changedFields: updateBugActivities.changedFields,
        oldValues: updateBugActivities.oldValues,
        newValues: updateBugActivities.newValues,
    };
};