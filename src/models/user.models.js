const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true }, // For Google users
    password: { type: String, required: function () { return !this.googleId; } },
    category: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5], // Restricts values to 0 or 1
        required: false, // Ensures category must be provided
        default: 0    // Optional: sets default value to 0 if not provided
    },
    isVerified: { type: Boolean, required: false, default: false },
    usage: { type: Number, default: 0 },
    credits: {
        type: Number,
        default: 0,
        min: [0, 'Credits cannot be negative']
    },
    lastUsageDate: { type: Date, default: null },
    location: { type: String, required: false },  // New location field
    profilePicture: { type: String, required: false, default: null },
    subscriptionStatus: { type: String, required: false, default: null },
    fcmTokens: [{ type: String }], // NEW: store multiple device tokens
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastLogDate: { type: Date, default: null },
    status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active"
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    subscriptionPlan: {
        type: String,
        enum: ['free', 'monthly', 'yearly'],
        default: 'free'
    },
    paystackCustomerCode: {
        type: String
    }, // Helps you identify them in the Paystack dashboard
    subscriptionExpiry: {
        type: Date
    },
    paymentHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    partnerInvites: [
        {
            from: { type: Schema.Types.ObjectId, ref: "User" },
            status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    notifications: [
        {
            type: { type: String, enum: ['invite_rejected', 'partner_request', 'new_message'], required: true },
            message: { type: String, required: true },
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    healthProfile: {
        age: { type: Number },
        sex: { type: String, enum: ['male', 'female', 'other'] },
        weight: { type: Number }, // in kg
        height: { type: Number }, // in cm
        bmi: { type: Number },
        whr: { type: Number },
        bmr: { type: Number },
        eatingHabit: { type: String }, // e.g., 'omnivore', 'vegetarian', etc.
        preferences: [{ type: String }], // dietary preferences
        conditions: [{ type: String }],  // e.g., 'diabetes', 'hypertension'
        goals: [{ type: String }]
    }
},
    {
        timestamps: true
    })

const User = mongoose.model("User", userModel);
module.exports = User;