const mongoose = require("mongoose");

const UserGithubSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
});

const UserGithub = mongoose.model("UserGithub", UserGithubSchema);

module.exports = UserGithub;
