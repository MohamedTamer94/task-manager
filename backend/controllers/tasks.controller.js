const {
    listTasks: listTasksService,
    createTask: createTaskService,
    getTask: getTaskService,
    updateTask: updateTaskService,
    deleteTask: deleteTaskService
} = require("../services/tasks.service");
const ApiError = require("../utils/ApiError");
exports.getAllTasks = async (req, res) => {
    // parse query to get required fields for pagination and filtering
    const {
        page = 1,
        limit = 20,
        q,
        status,
        priority,
        from,
        to
    } = req.validated.query;

    const result = await listTasksService({ page, limit, q, status, priority, from, to });

    return res.json({
        data: [...result.items],
        meta: { page: page, limit: limit, total: result.totalCount, pages: result.totalPages }
    })
};

exports.createTask = async (req, res) => {
    const {
        title,
        description,
        status,
        priority,
        dueDate
    } = req.validated.body;

    let task = await createTaskService({ title, description, status, priority, dueDate });

    return res.status(201).json({ message: "Task created successfully", success: true, data: task });
};

exports.getTask = async (req, res, next) => {
    const { id } = req.validated.params;

    const task = await getTaskService(id);

    if (!task) {
        return next(ApiError.notFound(`Task with id ${id} can't be found`, {
            code: "NOT_FOUND"
        }));
    }

    return res.json({ data: task })
};

exports.updateTask = async (req, res, next) => {
    const { id } = req.validated.params;
    const updateParams = req.validated.body;

    const task = await updateTaskService(id, updateParams);

    if (!task) {
        return next(ApiError.notFound(`Task with id ${id} can't be found`, {
            code: "NOT_FOUND"
        }));
    }

    return res.json({ data: task, success: true })
};

exports.deleteTask = async (req, res, next) => {
    const { id } = req.validated.params;

    const task = await deleteTaskService(id);

    if (!task) {
        return next(ApiError.notFound(`Task with id ${id} can't be found`, {
            code: "NOT_FOUND"
        }));
    }

    return res.status(200).json({success: true});
};