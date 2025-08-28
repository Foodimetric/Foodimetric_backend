const route = require("express").Router();
const { ChatController } = require("../controllers/ChatController");
const requireLogin = require("../utils/requireLogin")
const chatController = new ChatController();
const checkMaintenance = require("../middleware/checkMaintenance");


route.use(checkMaintenance); // applies to ALL user routes
route.post('/chat', requireLogin, chatController.chat);

module.exports = route;