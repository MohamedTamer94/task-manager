const Task = require("../models/Task");

/**
 * Fetch tasks using the given pagination and filtering constraints
 * @param {Object} params
 * @param {number} params.page - Page number, starts from 1
 * @param {number} params.limit - Number of items per page, maximum is 100
 * @param {string} [params.q] - Search query (optional)
 * @param {string} [params.status] - Filter results by status (optional)
 * @param {string} [params.priority] - Filter results by priority (optional)
 * @param {string} [params.from] - Limits to results since a specific date (optional)
 * @param {string} [params.to] - Limits to results until a specific date (optional)
 *
 * @returns {Promise<{items: Task[], totalCount: number, totalPages: number}>}
 */
exports.listTasks = async ({
  page,
  limit,
  q,
  status,
  priority,
  from,
  to
}) => {
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
        filters.title = {$regex: q, $options: "i"};
    }
    const itemsPromise = Task.find(filters)
        .sort({dueDate: - 1, createdAt: -1})
        .skip(skip)
        .limit(limit)
        .exec();
    
    // find total count for frontend pagination
    const totalCountPromise = Task.countDocuments(filters);
    const [items, totalCount] = await Promise.all([itemsPromise, totalCountPromise]);
    const totalPages = Math.ceil(totalCount / limit);
    return {
        items,
        totalCount,
        totalPages
    }
};

/**
 * Create a new task with the specified orioerties
 * 
 * @param {object} params
 * @param {string} params.title The task's title (required)
 * @param {string} [params.description] The task's description (optional)
 * @param {string} [params.status] The task's status (todo, doing, done) (optional)
 * @param {string} [params.priority] The task's priority (low, medium, high) (optional)
 * @param {Date} params.dueDate The task's due date (optional)
 * @returns {Promise<Task>}
 */
exports.createTask = async ({
    title,
    description,
    status,
    priority,
    dueDate
}) => {
    const newTask = new Task({
        title,
        description,
        status,
        priority,
        dueDate
    });
    await newTask.save();

    return newTask;
};

/**
 * Get one task by id
 * 
 * @param {string} id The task's id
 * @returns {Promise<Task|null>}
 */
exports.getTask = async (id) => {
    return await Task.findOne({_id: id, deletedAt: null})
};

/**
 * Update an existing task. Supports partial updates
 * 
 * @param {string} id The to-be-updated task's id
 * @param {object} updateParams The parameters to update
 * @returns {Promise<Task|null>}
 */
exports.updateTask = async (id, updateParams) => {
    return await Task.findOneAndUpdate({_id: id, deletedAt: null}, {$set: updateParams}, { returnDocument: 'after', runValidators: true, context: "query" });
};

/**
 * Soft delete a task
 * 
 * @param {string} id The to-be-deleted task's id
 * @returns {Promise<Task|null>}
 */
exports.deleteTask = async (id) => {
    return await Task.findOneAndUpdate({_id: id, deletedAt: null}, {$set: {deletedAt: new Date()}}, {returnDocument: 'after'});
};