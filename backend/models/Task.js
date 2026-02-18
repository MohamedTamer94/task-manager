const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minLength: 3
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["todo", "doing", "done"],
        default: "todo"
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    dueDate: {
        type: Date
    },
    // for soft deletion, instead of deleting record, we mark it as deleted by setting deleted at to the date of deletion
    deletedAt: {
        type: Date,
        default: null
    },
}, { timestamps: true });

// add indexes to make queries faster
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ priority: 1, deletedAt: 1 });
taskSchema.index({ dueDate: 1, deletedAt: 1 });
taskSchema.index({ status: 1, deletedAt: 1 });
taskSchema.index({ title: "text" });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;