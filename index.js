require("dotenv").config();

const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const Passport = require("passport");

const cookieParser = require("cookie-parser");

const session = require("express-session");

const flash = require("connect-flash");

const PassportLocal = require("./config/passport-local-strategy");

const GoogleStrategy = require("./config/google-strategy");

const GithubStrategy = require("./config/github-strategy");

const custom = require("./config/connect-flash");

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

app.use(
    session({
        name: "taskManager",
        secret: "taskManager",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 100,
        },
    })
);

app.use(Passport.initialize());

app.use(Passport.session());

app.use(Passport.setAuth);

app.use(cookieParser());

app.use(flash());

app.use(custom.setFlash);

app.use(express.urlencoded());

app.use("/", require("./routes/home"));

app.use(express.static(path.join(__dirname, "assets")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, (err) => {
    err
        ? console.log("Server not responding")
        : console.log(`Server respond successfully at port: ${port}`);
});
