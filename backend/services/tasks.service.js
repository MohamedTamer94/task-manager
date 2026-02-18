const Task = require("../models/Task");

/**
    Fetch tasks using the given pagination and filtering constrains
    @param {number} page - Page number, starts from 1
    @param {number} limit - Number of items per page, maximum is 100
    @param {string} q - Search query (optional)
    @param {string} status - filter results by status (optional)
    @param {string} priority - filter results by priority (optional)
    @param {string} from - limits to results since a specific date (optional)
    @param {string} to - limits to results until a specific date (optional)
    
    @returns {{items: Task[], totalCount: number, totalPages: number}}
*/
exports.listTasks = async (page, limit, q, status, priority, from, to) => {
    const skip = (page - 1) * limit;

    let filters = { deletedAt: null }; // to make soft-delete work
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (from || to) {
        filters.dueDate = {}; // time range is applied to due date, could have been applied to created at as well, but due date is more realistic
        if (from) {
            filters.dueDate.$gte = from;
        }
        if (to) {
            filters.dueDate.$lte = to;
        }
    }
    if (q) {
        // match when search appears anywhere in text, case insensitive
        filters.text = {$regex: q, $options: "i"};
    }
    const items = await Task.find(filters)
        .sort({dueDate: - 1, createdAt: -1})
        .skip(skip)
        .limit(limit)
        .exec();
    
    // find total count for frontend pagination
    const totalCount = await Task.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / limit);
    return {
        items,
        totalCount,
        totalPages
    }
}