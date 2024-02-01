const Task = require("../models/Task");

const List = require("../models/List");

const User = require("../models/User");

const bcrypt = require("bcrypt");

module.exports.home = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            let taskData = await Task.find({
                userId: res.locals.user._id,
                status: "pending",
            })
                .populate("taskList")
                .exec();
            let listData = await List.find({ userId: res.locals.user._id });
            let countTaskData = await Task.find({
                userId: res.locals.user._id,
            }).countDocuments();
            let listId = "";
            return res.render("home", {
                taskData: taskData,
                listData: listData,
                countTaskData: countTaskData,
                listId: listId,
            });
        } else {
            return res.redirect("/");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.signInUser = async (req, res) => {
    try {
        return res.redirect("/home");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.logoutUser = async (req, res) => {
    try {
        res.clearCookie("taskManager");
        return res.redirect("/");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.sign_up = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        } else {
            return res.render("sign_up");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.signUpUser = async (req, res) => {
    try {
        if (req.body) {
            let checkData = await User.find({ email: req.body.email });
            if (checkData != null) {
                if (req.body.password == req.body.cPassword) {
                    req.body.password = await bcrypt.hash(
                        req.body.password,
                        10
                    );
                    let userData = await User.create(req.body);
                    if (userData) {
                        return res.redirect("/");
                    } else {
                        console.log("User not registerd");
                        return res.redirect("back");
                    }
                } else {
                    console.log("Password not match");
                    return res.redirect("back");
                }
            } else {
                console.log("Email already exist");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.add_task_model = async (req, res) => {
    try {
        let listData = await List.find({ userId: res.locals.user._id });
        return res.render("ajax_add_task", {
            listData: listData,
        });
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.insertTask = async (req, res) => {
    try {
        if (req.body) {
            let listData = await List.findById(req.body.taskList);
            if (listData) {
                req.body.status = "pending";
                req.body.userId = res.locals.user._id;
                let taskData = await Task.create(req.body);
                if (taskData) {
                    listData.taskIds.push(taskData.id);
                    let editListData = await List.findByIdAndUpdate(
                        req.body.taskList,
                        listData
                    );
                    if (editListData) {
                        return res.redirect("back");
                    } else {
                        console.log("List not edited");
                        return res.redirect("back");
                    }
                } else {
                    console.log("Task not inserted");
                    return res.redirect("back");
                }
            } else {
                console.log("List not found");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.edit_task_model = async (req, res) => {
    try {
        if (req.body) {
            let taskData = await Task.findById(req.body.taskId);
            let listData = await List.find({});
            if (taskData) {
                return res.render("ajax_edit_task", {
                    taskData: taskData,
                    listData: listData,
                });
            } else {
                console.log("Task not found");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.editTask = async (req, res) => {
    try {
        if (req.body) {
            let oldTaskData = await Task.findById(req.body.oldId);
            let oldListData = await List.findById(oldTaskData.taskList);
            let pos = oldListData.taskIds.indexOf(req.body.oldId);
            oldListData.taskIds.splice(pos, 1);
            let editoldListData = await List.findByIdAndUpdate(
                oldTaskData.taskList,
                oldListData
            );
            if (editoldListData) {
                let taskData = await Task.findById(req.body.oldId);
                if (taskData) {
                    let editData = await Task.findByIdAndUpdate(
                        req.body.oldId,
                        req.body
                    );
                    if (editData) {
                        let newListData = await List.findById(
                            req.body.taskList
                        );
                        if (newListData) {
                            newListData.taskIds.push(req.body.oldId);
                            let updateNewList = await List.findByIdAndUpdate(
                                req.body.taskList,
                                newListData
                            );
                            if (updateNewList) {
                                return res.redirect("back");
                            } else {
                                console.log("New list not updated");
                                return res.redirect("back");
                            }
                        } else {
                            console.log("New list not found");
                            return res.redirect("back");
                        }
                    } else {
                        console.log("Data not updated");
                        return res.redirect("back");
                    }
                } else {
                    console.log("Old data not found");
                    return res.redirect("back");
                }
            } else {
                console.log("List not updated");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.deleteTask = async (req, res) => {
    try {
        if (req.query.id) {
            let taskData = await Task.findById(req.query.id);
            if (taskData) {
                let listData = await List.findById(taskData.taskList);
                if (listData) {
                    let pos = listData.taskIds.indexOf(req.query.id);
                    listData.taskIds.splice(pos, 1);
                    let editListData = await List.findByIdAndUpdate(
                        taskData.taskList,
                        listData
                    );
                    if (editListData) {
                        let deleteData = await Task.findByIdAndDelete(
                            req.query.id
                        );
                        if (deleteData) {
                            return res.redirect("back");
                        } else {
                            console.log("Task not deleted");
                            return res.redirect("back");
                        }
                    } else {
                        console.log("List not delete");
                        return res.redirect("back");
                    }
                } else {
                    console.log("List not found");
                    return res.redirect("back");
                }
            } else {
                console.log("Task not found");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.add_list_model = async (req, res) => {
    try {
        return res.render("ajax_add_list");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.insertList = async (req, res) => {
    try {
        if (req.body) {
            req.body.taskIds = [];
            req.body.userId = res.locals.user._id;
            let listData = await List.create(req.body);
            if (listData) {
                return res.redirect("back");
            } else {
                console.log("List not inserted");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.viewTaskOnList = async (req, res) => {
    try {
        if (req.query) {
            let taskData = await Task.find({ taskList: req.query.id })
                .populate("taskList")
                .exec();
            let countTaskData = await Task.find({}).countDocuments();
            let listData = await List.find({});
            let listId = req.query.id;
            if (taskData) {
                return res.render("ajax_home_list", {
                    taskData: taskData,
                    listData: listData,
                    countTaskData: countTaskData,
                    listId: listId,
                });
            } else {
                console.log("Task not found");
                return res.redirect("back");
            }
        } else {
            console.log("Invalid parameters");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.edit_list_model = async (req, res) => {
    try {
        if (req.body) {
            let listData = await List.findById(req.body.listId);
            if (listData) {
                return res.render("ajax_edit_list", {
                    listData: listData,
                });
            } else {
                console.log("List not found");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.deleteList = async (req, res) => {
    try {
        if (req.query.id) {
            let listData = await List.findById(req.query.id);
            if (listData) {
                let deleteTask = await Task.deleteMany({
                    _id: { $in: listData.taskIds },
                });
                if (deleteTask) {
                    let deleteList = await List.findByIdAndDelete(req.query.id);
                    if (deleteList) {
                        return res.redirect("back");
                    } else {
                        console.log("List not deleted");
                        return res.redirect("back");
                    }
                } else {
                    console.log("Task not deleted");
                    return res.redirect("back");
                }
            } else {
                console.log("Task not found");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.editList = async (req, res) => {
    try {
        if (req.body) {
            let listData = await List.findById(req.body.oldId);
            if (listData) {
                let editData = await List.findByIdAndUpdate(
                    req.body.oldId,
                    req.body
                );
                if (editData) {
                    return res.redirect("back");
                } else {
                    console.log("List not edited");
                    return res.redirect("back");
                }
            } else {
                console.log("List not found");
                return res.redirect("back");
            }
        } else {
            console.log("Something went wrong");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.add_tag_model = async (req, res) => {
    try {
        return res.render("ajax_add_tag");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.deleteMul = async (req, res) => {
    try {
        // console.log(req.body);
        if (req.body) {
            let taskData = await Task.find({}).populate("taskList").exec();
            let listData, editListData, pos;
            if (taskData) {
                req.body.pos.map(async (v, i) => {
                    // console.log(taskData[v].taskList.id);
                    listData = await List.findById(taskData[v].taskList.id);
                    // console.log(listData);
                    if (listData) {
                        pos = parseInt(
                            listData.taskIds.indexOf(taskData[v].id)
                        );
                        // console.log(pos, taskData[v].taskList.id, taskData[v].id);
                        if (pos >= 0) {
                            console.log(listData);
                            listData.taskIds.splice(pos, 1);
                            // console.log(listData);

                            editListData = await List.findByIdAndUpdate(
                                taskData[v].taskList.id,
                                listData
                            );
                            console.log(
                                await List.findById(taskData[v].taskList.id)
                            );
                            if (editListData) {
                                let deleteTask = await Task.findByIdAndDelete(
                                    taskData[v].id
                                );
                                console.log("deleted");
                            } else {
                                console.log("List not update");
                                // return res.redirect("back");
                            }
                        } else {
                            console.log("Invalid List");
                            // return res.redirect("back");
                        }
                    } else {
                        console.log("List not found");
                        // return res.redirect("back");
                    }
                });
            } else {
                console.log("Task not found");
                // return res.redirect("back");
            }
        } else {
            console.log("Invalid parameters");
            // return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};
