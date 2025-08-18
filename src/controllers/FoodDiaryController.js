const FoodDiaryRepository = require('../repositories/DiaryRepository');
const User = require("../models/user.models");
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
            const { user_id } = req.body;
            const foodData = req.body;

            // find user
            const user = await User.findById(user_id);
            if (!user) return res.status(404).json({ message: "User not found" });

            const today = new Date();
            const todayDateOnly = today.toISOString().split("T")[0];
            const lastLogDate = user.lastLogDate ? user.lastLogDate.toISOString().split("T")[0] : null;

            if (!lastLogDate) {
                // First log ever
                user.streak = 1;
            } else {
                const diffDays = Math.floor(
                    (new Date(todayDateOnly) - new Date(lastLogDate)) / (1000 * 60 * 60 * 24)
                );

                if (diffDays === 0) {
                    // Already logged today → do nothing
                } else if (diffDays === 1) {
                    user.streak += 1; // consecutive day
                } else {
                    user.streak = 1; // missed a day → reset streak
                }
            }

            user.lastLogDate = todayDateOnly;

            if (user.streak > user.longestStreak) {
                user.longestStreak = user.streak;
            }

            await user.save();

            // save food lo
            const food = await FoodDiaryRepository.createFood(foodData);

            res.status(201).json({
                message: "Food logged successfully",
                streak: user.streak,
                longestStreak: user.longestStreak,
                food,
            });

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // async createFood(req, res) {
    //     try {
    //         let imageUrl = null;

    //         // if image was uploaded
    //         if (req.file) {
    //             console.log("Multer file data:", req.file); // Debug log
    //             imageUrl = await uploadFile(
    //                 req.file.path,
    //                 req.file.originalname,
    //                 req.file.mimetype
    //             );

    //             // cleanup local temp file
    //             fs.unlinkSync(req.file.path);
    //         }

    //         const foodData = {
    //             ...req.body,
    //             imageUrl: imgUrl
    //         };

    //         const food = await FoodDiaryRepository.createFood(foodData);
    //         res.status(201).json(food);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(400).json({ message: error.message });
    //     }
    // }
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