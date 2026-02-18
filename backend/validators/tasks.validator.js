const joi = require("joi");

const listTasksQuerySchema = joi.object({
    page: joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional()
        .description("Page number, starts from 1"),
    limit: joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .optional()
        .description("Number of items per page. (Maximum is 100)"),
    q: joi.string()
        .trim()
        .min(1)
        .optional()
        .description("Search query for filtering results"),
    status: joi.string()
        .valid("todo", "doing", "done")
        .optional()
        .description("Filter results by status. Must be either: todo, doing, or done"),
    priority: joi.string()
        .valid("low", "medium", "high")
        .optional()
        .description("Filter results by priority. Must be either: low, medium, or high"),
    from: joi.date()
        .optional()
        .description("Get results since a specific due date."),
    to: joi.date()
        .optional()
        .min(joi.ref('from'))
        .description("Get results to a specific due date limit.")
}).unknown(false);

const createTaskBodySchema = joi.object({
    title: joi.string()
        .trim()
        .required()
        .min(3)
        .description("The task's title"),
    description: joi.string()
        .optional()
        .description("The task's description"),
    status: joi.string()
        .valid("todo", "doing", "done")
        .optional()
        .default("todo")
        .description("The task's status. Must be either: todo, doing, or done"),
    priority: joi.string()
        .valid("low", "medium", "high")
        .optional()
        .default("medium")
        .description("The task's priority. Must be either: low, medium, or high"),
    dueDate: joi.date()
        .optional()
        .description("The task's due date.")
}).unknown(false);

module.exports = {
    listTasksQuerySchema,
    createTaskBodySchema
};