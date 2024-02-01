const passport = require("passport");

const GitHubStrategy = require("passport-github").Strategy;

const UserGithub = require("../models/UserGithub");

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "http://localhost:8002/github/callback",
        },
        async (accessToken, refreshToken, profile, cb) => {
            let checkId = await UserGithub.findOne({
                userId: profile.id,
            });
            if (checkId) {
                cb(null, checkId);
            } else {
                let userdetails = {
                    name: profile.displayName,
                    username: profile.username,
                    userId: profile.id,
                };
                let userdatanew = await UserGithub.create(userdetails);
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
