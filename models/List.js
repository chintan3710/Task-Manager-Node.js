const mongoose = require("mongoose");

const listShema = mongoose.Schema({
    listName: {
        type: String,
    },
    listColor: {
        type: String,
        required: true,
    },
    taskIds: {
        type: Array,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const List = mongoose.model("List", listShema);

module.exports = List;
