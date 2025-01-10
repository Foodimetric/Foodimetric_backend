const Diary = require('../models/diary.model');

class FoodDiaryRepository {
    async createFood(data) {
        try {
            const food = new Diary(data);
            await food.save();
            return food;
        } catch (error) {
            throw new Error('Error saving food entry: ' + error.message);
        }
    }

    async getAllFoodsByUser(userId) {
        try {
            // Assuming there's a `userId` field in the Diary schema
            const foods = await Diary.find({ user_id: userId });
            return foods;
        } catch (error) {
            throw new Error('Error fetching foods for the user: ' + error.message);
        }
    }

    async getAllFoods() {
        try {
            const foods = await Diary.find();
            return foods;
        } catch (error) {
            throw new Error('Error fetching all foods: ' + error.message);
        }
    }

    async updateFood(foodId, updatedData) {
        try {
            const food = await Diary.findByIdAndUpdate(foodId, updatedData, { new: true });
            if (!food) {
                throw new Error('Food entry not found');
            }
            return food;
        } catch (error) {
            throw new Error('Error updating food: ' + error.message);
        }
    }

    async deleteFood(foodId) {
        try {
            const result = await Diary.findByIdAndDelete(foodId);
            if (!result) {
                throw new Error('Food entry not found');
            }
            return result;
        } catch (error) {
            throw new Error('Error deleting food: ' + error.message);
        }
    }
}

module.exports = new FoodDiaryRepository();
