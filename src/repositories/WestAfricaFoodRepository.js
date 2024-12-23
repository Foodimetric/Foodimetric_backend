const WestAfricaFood = require("../models/westafrica.models");

class WestAfricaFoodRepository {
    constructor() {
        this.Model = WestAfricaFood;
    }

    async addFoodData(fileData) {
        const foodList = Object.values(fileData)
            .filter(data => data["FOODCODE"] && data["FOOD NAMEIN ENGLISH"]) // Filter valid entries
            .map(data => ({
                foodCode: data["FOODCODE"],
                foodName: data["FOOD NAMEIN ENGLISH"] || "Unknown Food Name",
                nutrients: data,
            }));
    
        try {
            if (foodList.length === 0) {
                console.log("No valid food data found to add.");
                return;
            }
    
            const resp = await this.Model.collection.bulkWrite(
                foodList.map(food => ({
                    insertOne: { document: food }
                }))
            );
            console.log("Data successfully added:", resp.insertedCount);
            return resp;
        } catch (error) {
            console.error("Error adding food data:", error.message);
        }
    }
    
    async getAllFood() {
        return await this.Model.find();
    }
}

module.exports = WestAfricaFoodRepository;
