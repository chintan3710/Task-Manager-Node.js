const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("Database connected."))
    .catch((err) => console.log(err));

const port = process.env.PORT;

const app = express();

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded());

app.use("/", require("./routes/home"));

app.use(express.static(path.join(__dirname, "assets")));

app.listen(port, (err) => {
    err
        ? console.log("Server not responding")
        : console.log(`Server respond successfully at port: ${port}`);
});
