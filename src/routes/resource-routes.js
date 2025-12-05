const { ResourceController } = require("../controllers/ResourceController.js");
const route = require("express").Router();


// Public
route.get("/resources", ResourceController.getAll);
route.get("/resources/category/:category", ResourceController.getByCategory);

// Likes
route.post("/resources/:id/like", ResourceController.like);

// Admin
route.post("/admin/resources", ResourceController.create);
route.put("/admin/resources/:id", ResourceController.update);
route.delete("/admin/resources/:id", ResourceController.delete);

module.exports = route;
