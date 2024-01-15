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
});

const List = mongoose.model("List", listShema);

module.exports = List;
