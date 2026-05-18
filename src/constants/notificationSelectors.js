export const notificationsSelector = (action, entityType, entityId, entityTitle, actorUserId) => {
    return {
        action: action,
        entityType: entityType,
        entityId: entityId,
        entityTitle: entityTitle,
        actorUserId: actorUserId,
    }
}