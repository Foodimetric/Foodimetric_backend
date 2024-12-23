const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const westAfricaFoodSchema = new Schema({
    foodCode: { type: String, required: true, unique: true },
    foodName: { type: String, required: true },
    nutrients: { type: Object }, // Store nutrient data as an object
}, {
    timestamps: true
});

const WestAfricaFood = mongoose.model("WestAfricaFood", westAfricaFoodSchema);
module.exports = WestAfricaFood;
