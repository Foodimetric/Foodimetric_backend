const express = require('express');
const router = express.Router();
const { AdminController } = require('../controllers/AdminController');
const authenticateAdmin = require("../middleware/authenticateAdmin");

const adminController = new AdminController();

router.post('/login', adminController.login);
router.get("/messages", authenticateAdmin, adminController.getAllMessages);
router.get('/dashboard/analytics', authenticateAdmin, adminController.getAnalytics);
router.post('/dashboard/reset-credits', authenticateAdmin, adminController.creditVerifiedUsers);


module.exports = router;