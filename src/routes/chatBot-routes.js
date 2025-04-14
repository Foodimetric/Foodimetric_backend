const route = require("express").Router();
const { ChatController } = require("../controllers/ChatController");
const requireLogin = require("../utils/requireLogin")
const chatController = new ChatController();


route.post('/chat', requireLogin, chatController.chat);

module.exports = route;