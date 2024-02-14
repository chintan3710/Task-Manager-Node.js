const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");

const bcrypt = require("bcrypt");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:8002/google/callback",
        },
        async (accessToken, refreshToken, profile, cb) => {
            let checkemail = await User.findOne({
                email: profile.emails[0].value,
            });
            if (checkemail) {
                cb(null, checkemail);
            } else {
                let userdetails = {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    profileImage: "",
                    password: await bcrypt.hash("12345", 10),
                };
                let userdatanew = await User.create(userdetails);
                if (userdatanew) {
                    return cb(null, userdatanew);
                } else {
                    return cb(null, false);
                }
            }
        }
    )
);

module.exports = passport;
