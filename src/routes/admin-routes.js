const express = require('express');
const router = express.Router();
const { AdminController } = require('../controllers/AdminController');
const authenticateAdmin = require("../middleware/authenticateAdmin");

const adminController = new AdminController();

router.post('/login', adminController.login);
router.post("/login-verify", adminController.otpVerify);
router.post("/resend-otp", adminController.resendOtp);
router.get("/messages", authenticateAdmin, adminController.getAllMessages);
router.get('/dashboard/analytics', authenticateAdmin, adminController.getAnalytics);
router.post('/dashboard/reset-credits', authenticateAdmin, adminController.creditVerifiedUsers);
router.put("/update-credit", adminController.updateUserCredit)
router.patch("/users/:id/suspend", authenticateAdmin, adminController.suspendUser);
router.patch("/users/:id/activate", authenticateAdmin, adminController.activateUser);
router.delete("/users/:id", authenticateAdmin, adminController.deleteUser);
router.post("/create-admin", authenticateAdmin, adminController.createAdmin);
router.post("/maintenance-mode", authenticateAdmin, adminController.toggleMaintenance);
router.post("/activity/log", authenticateAdmin, adminController.logActivity); // Endpoint to log an action
router.get("/activity/logs", authenticateAdmin, adminController.getActivityLogs); // Endpoint to fetch logs


module.exports = router;