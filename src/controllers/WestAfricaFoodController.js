const WestAfricaFoodRepository = require("../repositories/WestAfricaFoodRepository");
const { certainRespondMessage } = require("../utils/response");

const westAfricaFoodRepository = new WestAfricaFoodRepository();

class WestAfricaFoodController {
    async uploadFoodData(req, res) {
        try {
            const fileData = req.body; // Ensure the frontend sends parsed JSON data
            const result = await westAfricaFoodRepository.addFoodData(fileData);
            certainRespondMessage(res, result, "Data uploaded successfully", 200);
        } catch (error) {
            res.status(500).json({ message: "Error uploading data", error: error.message });
        }
    }

    async getAllFood(req, res) {
        try {
            const result = await westAfricaFoodRepository.getAllFood();
            certainRespondMessage(res, result, "Data fetched successfully", 200);
        } catch (error) {
            res.status(500).json({ message: "Error fetching data", error: error.message });
        }
    }
}

module.exports = WestAfricaFoodController;
