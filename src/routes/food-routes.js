const { FoodController } = require("../controllers/FoodController");

const route = require("express").Router();
const foodController = new FoodController()

route.post("/get-details", foodController.getFoodByDetails)
route.get("/", foodController.getAll)
route.get("/by-location/:location", foodController.filterByLocation);


module.exports = route