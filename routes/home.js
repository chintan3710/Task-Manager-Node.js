const express = require("express");

const homeController = require("../controller/homeController");

const routes = express();

routes.get("/", homeController.home);

routes.get("/add_task_model", homeController.add_task_model);

routes.post("/insertTask", homeController.insertTask);

routes.post("/edit_task_model", homeController.edit_task_model);

routes.post("/editTask", homeController.editTask);

routes.get("/deleteTask", homeController.deleteTask);

routes.get("/add_list_model", homeController.add_list_model);

routes.post("/insertList", homeController.insertList);

module.exports = routes;
