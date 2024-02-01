const express = require("express");

const Passport = require("passport");

const homeController = require("../controller/homeController");

const routes = express();

routes.get("/", async (req, res) => {
    // console.log(res.locals.user);
    let data = res.locals.user;
    if (data) {
        return res.redirect("/home");
    } else {
        return res.render("sign_in");
    }
});

routes.get("/home", Passport.checkAuth, homeController.home);

routes.post(
    "/signInUser",
    Passport.authenticate("userLogin", { failureRedirect: "/" }),
    homeController.signInUser
);

routes.get("/sign_up", homeController.sign_up);

routes.get("/logoutUser", homeController.logoutUser);

routes.post("/signUpUser", homeController.signUpUser);

routes.get(
    "/google",
    Passport.authenticate("google", { scope: ["profile", "email"] })
);

routes.get(
    "/google/callback",
    Passport.authenticate("google", {
        failureRedirect: "/",
        successRedirect: "/home",
    })
);

routes.get("/github", Passport.authenticate("github", { scope: ["profile"] }));

routes.get(
    "/github/callback",
    Passport.authenticate("github", {
        failureRedirect: "/",
        successRedirect: "/home",
    })
);

routes.get("/add_task_model", homeController.add_task_model);

routes.post("/insertTask", homeController.insertTask);

routes.post("/edit_task_model", homeController.edit_task_model);

routes.post("/editTask", homeController.editTask);

routes.get("/deleteTask", homeController.deleteTask);

routes.get("/add_list_model", homeController.add_list_model);

routes.post("/insertList", homeController.insertList);

routes.get("/viewTaskOnList", homeController.viewTaskOnList);

routes.post("/edit_list_model", homeController.edit_list_model);

routes.get("/deleteList", homeController.deleteList);

routes.post("/editList", homeController.editList);

routes.get("/add_tag_model", homeController.add_tag_model);

routes.post("/deleteMul", homeController.deleteMul);

module.exports = routes;
