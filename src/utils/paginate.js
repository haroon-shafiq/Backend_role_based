const paginate = async ({ model, page, limit, where, select, include }) => {
    const skip = (page - 1) * limit;
    const take = limit + 1;

    const data = await model.findMany({ skip, take, where, select, include });
    console.log("Data", data);
    const hasMore = data.length > limit;
    if (hasMore) {
        data.pop();
    }
    const totalProjects = await model.count({ where });

    return { data, hasMore, totalProjects };
};

export default paginate;