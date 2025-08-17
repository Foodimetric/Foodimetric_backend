const FoodDiaryRepository = require('../repositories/DiaryRepository');
const { uploadFile } = require('../config/googleDrive');
const fs = require("fs");

class FoodDiaryController {
    // async createFood(req, res) {
    //     try {
    //         const foodData = req.body; // Assume the body contains the required fields
    //         const food = await FoodDiaryRepository.createFood(foodData);
    //         res.status(201).json(food);
    //     } catch (error) {
    //         res.status(400).json({ message: error.message });
    //     }
    // }

    async createFood(req, res) {
        try {
            let imageUrl = null;

            // if image was uploaded
            if (req.file) {
                console.log("Multer file data:", req.file); // Debug log
                imageUrl = await uploadFile(
                    req.file.path,
                    req.file.originalname,
                    req.file.mimetype
                );

                // cleanup local temp file
                fs.unlinkSync(req.file.path);
            }

            const foodData = {
                ...req.body,
                imageUrl: imgUrl
            };

            const food = await FoodDiaryRepository.createFood(foodData);
            res.status(201).json(food);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: error.message });
        }
    }
    async getAllFoodsByUser(req, res) {
        try {
            const userId = req.params.userId; // Assuming userId is passed in the URL
            const foods = await FoodDiaryRepository.getAllFoodsByUser(userId);
            res.status(200).json(foods);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllFoods(req, res) {
        try {
            const foods = await FoodDiaryRepository.getAllFoods();
            res.status(200).json(foods);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateFood(req, res) {
        try {
            const foodId = req.params.foodId;
            const updatedData = req.body; // New food data
            const updatedFood = await FoodDiaryRepository.updateFood(foodId, updatedData);
            res.status(200).json(updatedFood);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteFood(req, res) {
        try {
            const foodId = req.params.foodId;
            await FoodDiaryRepository.deleteFood(foodId);
            res.status(200).json({ message: 'Food entry deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new FoodDiaryController();