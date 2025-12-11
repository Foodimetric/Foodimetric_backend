const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodItemSchema = new Schema({
    name: {
        type: String,
        // required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        // required: true,
    },
    quantityUnit: {
        type: String,
        // required: true,
        trim: true,
    }
})
// Define the Diary schema
const diarySchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        required: true,
        ref: 'User'
    },
    date: { type: Date, required: true, default: Date.now }, // Automatically captures the current date
    time: { type: String, required: true }, // Time in HH:MM format
    foodEaten: { type: String, required: true }, // Food name
    quantity: { type: String }, // Quantity in grams, ml, or units
    quantityUnit: { type: String }, // Quantity in grams, ml, or units
    mealType: { type: String }, // Quantity in grams, ml, or units
    location: { type: String }, // Quantity in grams, ml, or units
    portionSize: { type: String }, // Quantity in grams, ml, or units
    tags: { type: [String], default: [] },
    foodItems: { type: [foodItemSchema], default: [] },
    additionalInfo: { type: String }, // Optional field for any additional notes
    imageUrl: { type: String },
    timestamp: {
        type: Date,
        default: Date.now
    },
});

// Create the Diary model
const Diary = mongoose.model("Diary", diarySchema);

// Export the model
module.exports = Diary;