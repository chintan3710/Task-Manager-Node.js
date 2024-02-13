const Task = require("../models/Task");

const List = require("../models/List");

const User = require("../models/User");

const Tag = require("../models/Tag");

const fs = require("fs");

const path = require("path");

const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");

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
            let tagData = await Tag.find({ userId: res.locals.user._id });
            let countTaskData = await Task.find({
                userId: res.locals.user._id,
            }).countDocuments();
            let listId = "";
            return res.render("home", {
                taskData: taskData,
                listData: listData,
                tagData: tagData,
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

module.exports.sign_in = async (req, res) => {
    try {
        return res.render("sign_in");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.signInUser = async (req, res) => {
    try {
        req.flash("success", "Login Successfully");
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
            if (checkData == "") {
                if (req.body.password == req.body.cPassword) {
                    let mailPass = req.body.password;
                    req.body.password = await bcrypt.hash(
                        req.body.password,
                        10
                    );
                    let userData = await User.create(req.body);
                    if (userData) {
                        const readFileContent = fs.readFileSync(
                            path.join(
                                __dirname,
                                "../templetes/new_registration_email.ejs"
                            ),
                            "utf8"
                        );
                        const lines = readFileContent.split("\n");
                        lines.splice(
                            25,
                            0,
                            `<strong>Email:</strong> ${req.body.email}`
                        );
                        lines.splice(
                            27,
                            0,
                            `<strong>Password:</strong> ${mailPass}`
                        );
                        const newFileContents = lines.join("\n");

                        const transporter = nodemailer.createTransport({
                            host: "smtp.gmail.com",
                            port: 465,
                            secure: true,
                            auth: {
                                user: "yom.no.replay@gmail.com",
                                pass: process.env.NODE_MAILER_PASS,
                            },
                        });
                        const info = await transporter.sendMail({
                            from: "yom.no.replay@gmail.com",
                            to: req.body.email,
                            subject: "Sent Pass",
                            text: "Your password is here!",
                            html: `${newFileContents}`,
                        });
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
                console.log("Email already exist. Login to view profile");
                return res.redirect("/");
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

module.exports.forget_pass = async (req, res) => {
    try {
        return res.render("forget_pass");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.sentOtp = async (req, res) => {
    try {
        if (req.body) {
            let checkMail = await User.findOne({ email: req.body.email });
            if (checkMail) {
                let otp = Math.round(100000 + Math.random() * 99999);
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: "yom.no.replay@gmail.com",
                        pass: process.env.NODE_MAILER_PASS,
                    },
                });
                const info = await transporter.sendMail({
                    from: "yom.no.replay@gmail.com",
                    to: req.body.email,
                    subject: "Sent OTP",
                    text: "Your otp is here!",
                    html: `${otp}`,
                });
                res.cookie("email", req.body.email);
                res.cookie("otp", otp);
                if (info) {
                    return res.redirect("/check_otp");
                } else {
                    console.log("Something went wrong");
                    return res.redirect("back");
                }
            } else {
                console.log("Email not registered");
                return res.redirect("back");
            }
        } else {
            console.log("Data not found");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.check_otp = async (req, res) => {
    try {
        return res.render("check_otp");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.verifyOtp = async (req, res) => {
    try {
        if (req.cookies.otp == req.body.otp) {
            return res.redirect("/change_pass");
        } else {
            console.log("Invalid OTP");
            return res.redirect("back");
        }
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.change_pass = async (req, res) => {
    try {
        return res.render("change_pass");
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.changePass = async (req, res) => {
    try {
        if (req.body) {
            let checkMail = await User.findOne({ email: req.cookies.email });
            if (checkMail) {
                if (
                    await bcrypt.compare(req.body.password, checkMail.password)
                ) {
                    console.log("This password is already used");
                    return res.redirect("back");
                } else {
                    if (req.body.password == req.body.c_pass) {
                        let pass = await bcrypt.hash(req.body.password, 10);
                        let updateData = await User.findByIdAndUpdate(
                            checkMail.id,
                            {
                                password: pass,
                            }
                        );
                        if (updateData) {
                            console.log("Password updated successfully");
                            return res.redirect("/");
                        } else {
                            console.log("Password not updated");
                            return res.redirect("back");
                        }
                    } else {
                        console.log("Password not match");
                        return res.redirect("back");
                    }
                }
            } else {
                console.log("Invalid email");
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
        let tagData = await Tag.find({ userId: res.locals.user._id });
        return res.render("ajax_add_task", {
            listData: listData,
            tagData: tagData,
        });
    } catch (err) {
        console.log(err);
        return res.redirect("back");
    }
};

module.exports.insertTask = async (req, res) => {
    try {
        if (req.body) {
            let tagData = [];
            req.body.taskTags.map(async (v, i) => {
                tagData.push(await Tag.findById(v));
            });
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
                    let editTagData;
                    tagData.map(async (v, i) => {
                        v.taskIds.push(taskData.id);
                        editTagData = await Tag.findByIdAndUpdate(v.id, v);
                    });
                    if (editListData) {
                        req.flash("success", "Task added Successfully");
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
            let listData = await List.find({ userId: res.locals.user._id });
            let tagData = await Tag.find({ userId: res.locals.user._id });
            if (taskData) {
                return res.render("ajax_edit_task", {
                    taskData: taskData,
                    listData: listData,
                    tagData: tagData,
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
                                req.flash(
                                    "success",
                                    "Task edited Successfully"
                                );
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
                            req.flash("success", "Task deleted Successfully");
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
                req.flash("success", "List added Successfully");
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
            let taskData = await Task.find({
                userId: res.locals.user._id,
                taskList: req.query.id,
            })
                .populate("taskList")
                .exec();
            let countTaskData = await Task.find({
                userId: res.locals.user._id,
            }).countDocuments();
            let listData = await List.find({ userId: res.locals.user._id });
            let tagData = await Tag.find({ userId: res.locals.user._id });
            let listId = req.query.id;
            if (taskData) {
                return res.render("ajax_home_list", {
                    taskData: taskData,
                    listData: listData,
                    tagData: tagData,
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
                        req.flash("success", "List deleted Successfully");
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
                    req.flash("success", "List edited Successfully");
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

module.exports.insertTag = async (req, res) => {
    try {
        if (req.body) {
            req.body.taskIds = [];
            req.body.userId = res.locals.user._id;
            let tagData = await Tag.create(req.body);
            if (tagData) {
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

module.exports.viewTaskOnTag = async (req, res) => {
    if (req.query) {
        let taskData = await Task.find({
            userId: res.locals.user._id,
            taskTags: req.query.id,
        })
            .populate("taskList")
            .exec();
        let listData = await List.find({ userId: res.locals.user._id });
        let tagData = await Tag.find({ userId: res.locals.user._id });
        let countTaskData = await Task.find({
            userId: res.locals.user._id,
        }).countDocuments();
        let listId = "";
        return res.render("ajax_home_list", {
            taskData: taskData,
            listData: listData,
            tagData: tagData,
            countTaskData: countTaskData,
            listId: listId,
        });
    } else {
        console.log("Invalid parameters");
        return res.redirect("back");
    }
};

module.exports.deleteMul = async (req, res) => {
    try {
        if (req.body) {
            let taskData = await Task.find({}).populate("taskList").exec();
            let listData, editListData, pos;
            if (taskData) {
                req.body.pos.map(async (v, i) => {
                    listData = await List.findById(taskData[v].taskList.id);
                    if (listData) {
                        pos = parseInt(
                            listData.taskIds.indexOf(taskData[v].id)
                        );
                        if (pos >= 0) {
                            listData.taskIds.splice(pos, 1);
                            editListData = await List.findByIdAndUpdate(
                                taskData[v].taskList.id,
                                listData
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

module.exports.viewProfile = async (req, res) => {
    try {
        if (req.query) {
            let userData = await User.findById(req.query.id);
            if (userData) {
                return res.render("ajax_profile", {
                    userData: userData,
                });
            } else {
                console.log("User not found");
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
