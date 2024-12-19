const { UserController } = require("../controllers/UserController");
const requireLogin = require("../utils/requireLogin")

const route = require("express").Router();
const userController = new UserController()

route.post("/sign-in", userController.signIn)
route.post("/sign-up", userController.signUp)
route.get("/logged-user", requireLogin, userController.getLoggedUser)
route.get("/user/:id", userController.getUserById)
route.patch("/update-profile", requireLogin, userController.updateProfile)
route.get("/verify-user/:token", userController.verifyUser)
route.get("/users/emails", (req, res) => userController.getAllUserEmails(req, res));

module.exports = route