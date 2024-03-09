const mongoose = require("mongoose");

const multer = require("multer");

const path = require("path");

const imagePath = "/var/task/uploads";

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
});

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", imagePath));
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now());
    },
});

UserSchema.statics.uploadImage = multer({ storage: imageStorage }).single(
    "profileImage"
);

UserSchema.statics.imageModelPath = imagePath;

const User = mongoose.model("User", UserSchema);

module.exports = User;
