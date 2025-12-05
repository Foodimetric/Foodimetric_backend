const { ResourceController } = require("../controllers/ResourceController.js");
const route = require("express").Router();
const resourceController = new ResourceController()


// Public
route.get("/resources", resourceController.getAll);
route.get("/resources/category/:category", resourceController.getByCategory);

// Likes
route.post("/resources/:id/like", resourceController.like);

// Admin
route.post("/admin/resources", resourceController.create);
route.put("/admin/resources/:id", resourceController.update);
route.delete("/admin/resources/:id", resourceController.delete);

module.exports = route; 