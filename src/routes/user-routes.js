const { UserController } = require("../controllers/UserController");
const { NewsletterController } = require('../controllers/NewsletterController')
const requireLogin = require("../utils/requireLogin")
const checkMaintenance = require("../middleware/checkMaintenance");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const User = require("../models/user.models");

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

route.use(checkMaintenance); // applies to ALL user routes
route.post("/sign-in", userController.signIn)
route.post("/sign-up", userController.signUp)
route.post("/save-fcm-token", userController.saveFcmToken);
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
// route.get(
//     "/google",
//     passport.authenticate("google", { scope: ["profile", "email"] })
// );

route.get(
    "/google",
    (req, res, next) => {
        // Capture the ref query parameter from the initial request
        const refParam = req.query.ref;
        // Pass it to the next middleware (passport) in the state option
        req.session.googleAuthState = { ref: refParam };
        next();
    },
    passport.authenticate("google", {
        scope: ["profile", "email"],
        // Pass the state to Google's auth URL
        state: req.session.googleAuthState ? JSON.stringify(req.session.googleAuthState) : undefined
    })
);

// Callback route for Google to redirect to
route.get(
    "/google/callback",
    (req, res, next) => {
        console.log("🔍 Google callback query params:", req.query);
        next();
    },
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        let referralId = null;
        if (req.query.state) {
            try {
                const state = JSON.parse(req.query.state);
                referralId = state.ref;
            } catch (err) {
                console.error("Error parsing state from Google callback:", err);
            }
        }

        const newUser = req.user;

        if (referralId && newUser) {
            try {
                const sender = await User.findById(referralId);
                if (sender && !sender.partner) {
                    await User.bulkWrite([
                        { updateOne: { filter: { _id: newUser._id }, update: { $set: { partner: sender._id } } } },
                        { updateOne: { filter: { _id: sender._id }, update: { $set: { partner: newUser._id }, $pull: { partnerInvites: { from: newUser._id } } } } }
                    ]);
                    console.log(`Partner relationship established via Google sign-up between ${sender.firstName} and ${newUser.firstName}`);
                }
            } catch (err) {
                console.error("Error linking Google-signed-up partner accounts:", err);
            }
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
            credits: req.user.credits,
            streak: req.user.streak,
            longestStreak: req.user.longestStreak,
            healthProfile: req.user.healthProfile,
            isVerified: req.user.isVerified,
            partnerInvites: req.user.partnerInvites,
            partner: req.user.partner,
            status: req.user.status,
            notifications: req.user.notifications
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
route.post("/invite-partner", requireLogin, userController.sendInvite);
// Accept invite
route.post("/accept-invite/:id", requireLogin, userController.acceptInvite);
// Decline invite
route.post("/decline-invite/:id", requireLogin, userController.rejectInvite);

module.exports = route