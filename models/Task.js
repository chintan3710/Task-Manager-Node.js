const mongoose = require("mongoose");

const taskShema = mongoose.Schema({
    taskName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    taskList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "List",
        required: true,
    },
    dueDate: {
        type: String,
    },
    taskTags: {
        type: Array,
    },
    status: {
        type: String,
        required: true,
    },
});

const Task = mongoose.model("Task", taskShema);

module.exports = Task;
