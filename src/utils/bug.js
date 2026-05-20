
export const createBugData = ({ title, type, status, description, imageURL, deadline, projectId, creatorId }) => {
    const data = {
        title,
        type,
        status,
        description: description || null,
        image: imageURL || null,
        deadline: deadline ? new Date(deadline) : null,
        projectId,
        creatorId,
    }

    return data;
}