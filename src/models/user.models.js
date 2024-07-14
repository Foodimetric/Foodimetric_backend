const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    category: {type: String, required: false},
    isVerified: {type: Boolean, required: false, default: false},
},
{
    timestamps: true
})

const User = mongoose.model("User", userModel);
module.exports = User;