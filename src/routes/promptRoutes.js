// routes/promptRoutes.js
const express = require("express");
const router = express.Router();
const PromptController = require("../controllers/PromptController");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Admin endpoints
router.post("/prompts", authenticateAdmin, PromptController.upsertPrompts);
router.get("/prompts", PromptController.getAllPrompts);

// Public/user endpoints
router.get("/prompts/:category", PromptController.getPrompts);

module.exports = router;
