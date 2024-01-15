const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1/to-do-db");

const db = mongoose.connection;

db.once("open", (err) => {
    err
        ? console.log("Database not connected")
        : console.log("Database connected");
});

module.exports = db;
