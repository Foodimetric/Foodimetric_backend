const FoodDiaryRepository = require('../repositories/DiaryRepository');
const User = require("../models/user.models");
const { uploadFile } = require('../config/googleDrive');
const fs = require("fs");

class FoodDiaryController {
    async createFood(req, res) {
        try {
            const { user_id } = req.body;
            const foodData = req.body;

            // Find user
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const today = new Date();
            // Normalize today's date to the start of the day for consistent calculations
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            let streakWasUpdated = false;

            if (!user.lastLogDate) {
                // First log ever, start the streak at 1
                user.streak = 1;
                streakWasUpdated = true;
            } else {
                // Normalize the last log date to the start of its day
                const lastLogDay = new Date(user.lastLogDate.getFullYear(), user.lastLogDate.getMonth(), user.lastLogDate.getDate());

                // Calculate the number of days passed since the last log
                const diffTime = todayDateOnly.getTime() - lastLogDay.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // User logged yesterday and today -> streak goes up
                    user.streak += 1;
                    streakWasUpdated = true;
                } else if (diffDays === 2) {
                    // User skipped exactly 1 day -> offer to restore
                    // We DO NOT update the streak or lastLogDate here yet.
                    return res.status(200).json({
                        success: true,
                        message: "You missed one day! Would you like to restore your streak for 300 credits?",
                        canRestoreStreak: true
                    });
                } else if (diffDays > 2) {
                    // Missed more than one day, reset streak
                    user.streak = 1;
                    streakWasUpdated = true;
                } else if (diffDays === 0) {
                    // Already logged today, no change
                    streakWasUpdated = false;
                }
            }

            // Update last log date and longest streak
            user.lastLogDate = todayDateOnly;
            if (user.streak > user.longestStreak) {
                user.longestStreak = user.streak;
            }

            await user.save();

            // Save food log
            const food = await FoodDiaryRepository.createFood(foodData);

            res.status(201).json({
                message: "Food logged successfully",
                streak: user.streak,
                longestStreak: user.longestStreak,
                food,
                streakUpdated: streakWasUpdated,
                canRestoreStreak: false
            });

        } catch (error) {
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