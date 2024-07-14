const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodModel = new Schema({
    foodName: {type: String, required: true},
    details: {type: Object},
    location: String,
    
})

const Food = mongoose.model("Food", foodModel);
module.exports = Food;