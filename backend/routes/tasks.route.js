const express = require("express");
const router = express.Router();
const { getAllTasks, createTask, getTask, updateTask, deleteTask } = require("../controllers/tasks.controller");
const { listTasksQuerySchema } = require("../validators/tasks.validator");
const validate = require("../middlewares/validate.middleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", validate({query: listTasksQuerySchema}), asyncHandler(getAllTasks));
router.post("/", asyncHandler(createTask));
router.get("/:id", asyncHandler(getTask));
router.patch("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));

module.exports = router;