const passport = require("passport");

const GitHubStrategy = require("passport-github2").Strategy;

const UserGithub = require("../models/UserGithub");

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "https://dot-done.vercel.app/github/callback",
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
