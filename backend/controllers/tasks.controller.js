const {
    listTasks: listTasksService,
    createTask: createTaskService
} = require("../services/tasks.service");
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
        meta: {page: page, limit: limit, total: result.totalCount, pages: result.totalPages}
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

    let task = await createTaskService({title, description, status, priority, dueDate});

    return res.status(201).json({message: "Task created successfully", success: true, data: task});
};

exports.getTask = (req, res) => {
    // TODO: Implement
};

exports.updateTask = (req, res) => {
    // TODO: Implement
};

exports.deleteTask = (req, res) => {
    // TODO: Implement
};