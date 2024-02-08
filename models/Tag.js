const mongoose = require("mongoose");

const tagShema = mongoose.Schema({
    tagName: {
        type: String,
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

const Tag = mongoose.model("Tag", tagShema);

module.exports = Tag;
