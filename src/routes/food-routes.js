const { FoodController } = require("../controllers/FoodController");
const WestAfricaFoodController = require("../controllers/WestAfricaFoodController");

const route = require("express").Router();
const foodController = new FoodController()
const westAfricaFoodController = new WestAfricaFoodController();

route.post("/get-details", foodController.getFoodByDetails)
route.get("/", foodController.getAll)
route.get("/by-location/:location", foodController.filterByLocation);
// route.post("/westafrica/upload", (req, res) => westAfricaFoodController.uploadFoodData(req, res));
route.get("/westafrica", (req, res) => westAfricaFoodController.getAllFood(req, res));


module.exports = route