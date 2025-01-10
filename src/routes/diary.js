const express = require('express');
const FoodDiaryController = require('../controllers/FoodDiaryController');
const router = express.Router();

router.post('/', FoodDiaryController.createFood);
router.get('/diary/:userId', FoodDiaryController.getAllFoodsByUser);
router.get('/diary', FoodDiaryController.getAllFoods);
router.put('/diary/:foodId', FoodDiaryController.updateFood);
router.delete('/diary/:foodId', FoodDiaryController.deleteFood);

module.exports = router;
