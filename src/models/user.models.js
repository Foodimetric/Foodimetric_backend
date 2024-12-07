const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    category: { 
        type: Number, 
        enum: [0, 1], // Restricts values to 0 or 1
        required: false, // Ensures category must be provided
        default: 0    // Optional: sets default value to 0 if not provided
    },
    isVerified: {type: Boolean, required: false, default: false},
},
{
    timestamps: true
})

const User = mongoose.model("User", userModel);
module.exports = User;