const { UserController } = require("../controllers/UserController");
const { NewsletterController } = require('../controllers/NewsletterController')
const requireLogin = require("../utils/requireLogin")
const passport = require("passport");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const route = require("express").Router();
const userController = new UserController()
const newsletterController = new NewsletterController()

// Define the path to your uploads directory
const uploadDir = path.join(__dirname, 'uploads');

// Check if the directory exists, and create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Store images in 'uploads' folder
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
        fields: 20, // Limit number of fields in the request
    },
});
route.post("/sign-in", userController.signIn)
route.post("/sign-up", userController.signUp)
router.post("/save-fcm-token", userController.saveFcmToken);
route.get("/logged-user", requireLogin, userController.getLoggedUser)
route.get("/platform/analytics", requireLogin, userController.getUserAnalytics)
route.post("/analytics", requireLogin, userController.saveAnalytics)
route.get("/user/:id", userController.getUserById)
route.patch("/update-profile", requireLogin, upload.single('profilePicture'), userController.updateProfile)
route.get("/verify-user/:token", userController.verifyUser)
route.post("/verify-user", userController.verifyUser)
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
    passport.authenticate("google", { session: false }),
    (req, res) => {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // ✅ Generate token
        const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // ✅ Send user data & token to frontend
        const user = {
            token,
            _id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            category: req.user.category,
            location: req.user.location,
            createdAt: req.user.createdAt,
            profilePicture: req.user.profilePicture || '',
            credits: req.user.credits
        };

        // ✅ Redirect with query params
        res.redirect(
            `${process.env.FRONTEND_DASHBOARD}?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
        );
    }
);



route.post("/contact", userController.contact);

route.post("/forgot-password", (req, res) => userController.forgotPassword(req, res));

// Reset Password
route.post("/reset-password", (req, res) => userController.resetPassword(req, res))
route.post("/deduct-credit", requireLogin, userController.deductCredit);

module.exports = route