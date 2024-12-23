const { UserController } = require("../controllers/UserController");
const {NewsletterController} = require('../controllers/NewsletterController')
const requireLogin = require("../utils/requireLogin")
const passport = require("passport");

const route = require("express").Router();
const userController = new UserController()
const newsletterController = new NewsletterController()

route.post("/sign-in", userController.signIn)
route.post("/sign-up", userController.signUp)
route.get("/logged-user", requireLogin, userController.getLoggedUser)
route.get("/user/:id", userController.getUserById)
route.patch("/update-profile", requireLogin, userController.updateProfile)
route.get("/verify-user/:token", userController.verifyUser)
route.get("/users/emails", userController.getAllUserEmails);
route.post("/newsletter/subscribe", (req, res) => newsletterController.subscribe(req, res));
route.delete("/users/delete", requireLogin, (req, res) => userController.deleteAccount(req, res));
route.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }) 
);

// Callback route for Google to redirect to
route.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    async (req, res) => {
        try {
            const profile = req.user; // Google profile

            const result = await userController.signUpWithGoogle(profile);

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: "Google Authentication Failed", error: error.message });
        }
    }
);
route.post("/forgot-password", (req, res) => userController.forgotPassword(req, res));

// Reset Password
route.post("/reset-password", (req, res) => userController.resetPassword(req, res))

module.exports = route