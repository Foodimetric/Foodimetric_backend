const WestAfricaFood = require("../models/westafrica.models");

class WestAfricaFoodRepository {
    constructor() {
        this.Model = WestAfricaFood;
    }

    async addFoodData(fileData) {
        const foodList = Object.values(fileData).map(data => ({
            foodCode: data["FOODCODE"],
            foodName: data["FOOD NAMEIN ENGLISH"] || "Unknown Food Name",
            nutrients: data,
        }));

        try {
            const resp = await this.Model.collection.bulkWrite(
                foodList.map(food => ({
                    insertOne: { document: food }
                }))
            );
            console.log("Data successfully added");
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
