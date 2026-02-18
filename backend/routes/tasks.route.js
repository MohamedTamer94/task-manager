const express = require("express");
const router = express.Router();
const { getAllTasks, createTask, getTask, updateTask, deleteTask } = require("../controllers/tasks.controller");
const { listTasksQuerySchema, createTaskBodySchema, idParamSchema, updateTaskBodySchema } = require("../validators/tasks.validator");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", validate({query: listTasksQuerySchema}), asyncHandler(getAllTasks));
router.post("/", validate({body: createTaskBodySchema}), asyncHandler(createTask));
router.get("/:id", validate({params: idParamSchema}), asyncHandler(getTask));
router.patch("/:id", validate({params: idParamSchema, body: updateTaskBodySchema}), asyncHandler(updateTask));
router.delete("/:id", validate({params: idParamSchema}), asyncHandler(deleteTask));

module.exports = router;