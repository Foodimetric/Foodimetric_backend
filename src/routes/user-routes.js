const { UserController } = require("../controllers/UserController");
const {NewsletterController} = require('../controllers/NewsletterController')
const requireLogin = require("../utils/requireLogin")
const passport = require("passport");
const path = require('path');
const multer = require('multer');

const route = require("express").Router();
const userController = new UserController()
const newsletterController = new NewsletterController()


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Store images in 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

// Set file filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};


// const upload = multer({ dest: 'uploads/' });
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // Max file size: 5MB
        fieldSize: 1024 * 1024, // Limit text field size to 10KB
        fields: 10, // Limit number of fields in the request
    },
});
route.post("/sign-in", userController.signIn)
route.post("/sign-up", userController.signUp)
route.get("/logged-user", requireLogin, userController.getLoggedUser)
route.get("/platform/analytics", requireLogin, userController.getUserAnalytics)
route.post("/analytics", requireLogin, userController.saveAnalytics)
route.get("/user/:id", userController.getUserById)
route.patch("/update-profile", requireLogin, upload.single('profilePicture'), userController.updateProfile)
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