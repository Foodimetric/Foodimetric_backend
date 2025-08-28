const express = require('express');
const multer = require('multer');
const FoodDiaryController = require('../controllers/FoodDiaryController');
const router = express.Router();
const checkMaintenance = require("../middleware/checkMaintenance");


// const upload = multer({ dest: "uploads/" }); // temp folder

router.use(checkMaintenance); // applies to ALL user routes

// router.post('/', upload.single("image"), FoodDiaryController.createFood);
router.post('/', FoodDiaryController.createFood);
router.get('/diary/:userId', FoodDiaryController.getAllFoodsByUser);
router.get('/diary', FoodDiaryController.getAllFoods);
router.put('/diary/:foodId', FoodDiaryController.updateFood);
router.delete('/diary/:foodId', FoodDiaryController.deleteFood);

module.exports = router;
