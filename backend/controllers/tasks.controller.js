const {listTasks: listTasksService} = require("../services/tasks.service");
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

    const result = await listTasksService(page, limit, q, status, priority, from, to);

    return res.json({
        data: [...result.items],
        meta: {page: page, limit: limit, total: result.totalCount, pages: result.totalPages}
    })
};

exports.createTask = (req, res) => {
    // TODO: Implement
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