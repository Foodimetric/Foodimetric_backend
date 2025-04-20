const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    quantity: { type: String, required: true }, // Quantity in grams, ml, or units
    additionalInfo: { type: String }, // Optional field for any additional notes
    timestamp: {
        type: Date,
        default: Date.now
    },
});

// Create the Diary model
const Diary = mongoose.model("Diary", diarySchema);

// Export the model
module.exports = Diary;