const passport = require("passport");

const PassportLocal = require("passport-local").Strategy;

const User = require("../models/User");

const bcrypt = require("bcrypt");

passport.use(
    "userLogin",
    new PassportLocal(
        {
            usernameField: "email",
        },
        async (email, password, done) => {
            let userData = await User.findOne({ email: email });
            if (userData) {
                if (await bcrypt.compare(password, userData.password)) {
                    return done(null, userData);
                } else {
                    return done(null, false);
                }
            } else {
                return done(null, false);
            }
        }
    )
);

passport.serializeUser(async (user, done) => {
    return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    let userRecord = await User.findById(id);
    if (userRecord) {
        return done(null, userRecord);
    } else {
        return done(null, false);
    }
});

passport.setAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    return next();
};

passport.checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.redirect("/");
    }
};

module.exports = passport;
