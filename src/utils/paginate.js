const paginate = async ({ model, page, limit, where, select, include }) => {
    const skip = (page - 1) * limit;
    const take = limit + 1;
    console.log("========>", page, limit)
    const query = page && limit ? { skip, take, where, select, include } : { where, select, include }
    const data = await model.findMany(query);
    console.log("Data", data);
    const hasMore = data.length > limit;
    if (hasMore) {
        data.pop();
    }
    const totalCount = await model.count({ where });

    return { data, hasMore, totalCount };
};

export default paginate;