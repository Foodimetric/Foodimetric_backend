const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { certainRespondMessage } = require("../utils/response");
const User = require("../models/user.models");
const Admin = require("../models/admin.models.js");
const FoodDiary = require("../models/diary.model.js");
const AnthropometricCalculation = require("../models/anthropometric.js")

class AdminController {
    async login(req, res) {
        const { email, password } = req.body;

        try {
            // Find admin by email (allowing both "admin" and "super-admin")
            const admin = await Admin.findOne({ email });
            console.log("Admin found:", admin);

            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                certainRespondMessage(res, false, "Invalid credentials", 401);
                return
            }

            // Generate JWT token
            const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });

            return res.json({
                success: true,
                token,
                role: admin.role,
                name: admin.name,
            });
        } catch (error) {
            certainRespondMessage(res, false, "Server error", 500);
            return
        }
    }

    async getAnalytics(req, res) {
        try {
            const now = new Date();

            const weeklyStart = new Date();
            weeklyStart.setDate(now.getDate() - 7);

            const monthlyStart = new Date();
            monthlyStart.setMonth(now.getMonth() - 1);

            const yearlyStart = new Date();
            yearlyStart.setFullYear(now.getFullYear() - 1);



            // **Users Performing Anthropometric Calculations**
            const userCalculations = await AnthropometricCalculation.aggregate([
                {
                    $group: {
                        _id: {
                            user: "$user_id", // Fix: Ensure it's "user_id" not "userId"
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.user",
                        calculations: {
                            $push: {
                                date: "$_id.date",
                                count: "$count"
                            }
                        },
                        totalCalculations: { $sum: "$count" }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                {
                    $project: {
                        _id: 0,
                        userId: "$userDetails._id",
                        name: { $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"] },
                        totalCalculations: 1,
                        calculations: 1
                    }
                },
                { $sort: { totalCalculations: -1 } }
            ]);

            // **Daily Signup Rate** - last 30 days
            const dailySignups = await User.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ]);

            // **Daily Usage Analytics** - last 30 days
            const dailyUsage = await User.aggregate([
                { $match: { lastUsageDate: { $ne: null } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastUsageDate" } },
                        count: { $sum: "$usage" }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ]);

            // **Daily Anthropometric Calculations** - last 30 days
            const dailyCalculations = await AnthropometricCalculation.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ]);

            // **Daily Food Diary Logs** - last 30 days
            const dailyFoodDiaryLogs = await FoodDiary.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ]);

            // **Weekly, Monthly, and Yearly Data for Anthropometric Calculations**
            const timeFrames = [
                { label: "weekly", startDate: new Date(now.setDate(now.getDate() - 7)) },
                { label: "monthly", startDate: new Date(now.setMonth(now.getMonth() - 1)) },
                { label: "yearly", startDate: new Date(now.setFullYear(now.getFullYear() - 1)) }
            ];

            let anthropometricStats = {};
            let foodDiaryStats = {};
            for (const { label, startDate } of timeFrames) {
                anthropometricStats[label] = await AnthropometricCalculation.countDocuments({ timestamp: { $gte: startDate } });
                foodDiaryStats[label] = await FoodDiary.countDocuments({ createdAt: { $gte: startDate } });
            }
            // **Total Anthropometric Calculations**
            const totalAnthropometricCalculations = await AnthropometricCalculation.countDocuments();

            // **Total Users and All Users**
            const totalUsers = await User.countDocuments();
            const allUsers = await User.find().select("firstName lastName email usage lastUsageDate location isVerified category googleId");

            // **Top 10 Users (by Usage)**
            const topUsers = await User.find().sort({ usage: -1 }).limit(10).select("firstName lastName email usage lastUsageDate");

            // **Top 10 Locations**
            const topLocations = await User.aggregate([
                { $match: { location: { $ne: null, $ne: "" } } },
                { $group: { _id: "$location", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // **Most Used Anthropometric Calculators**
            const mostUsedCalculators = await AnthropometricCalculation.aggregate([
                { $group: { _id: "$calculator_name", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            return res.json({
                dailySignups,
                userCalculations,
                dailyUsage,
                totalAnthropometricCalculations, // Added total anthropometric calculations
                totalUsers, // Added total users
                allUsers, // Added all users list
                dailyCalculations,
                weeklyCalculations: await AnthropometricCalculation.aggregate([
                    { $match: { timestamp: { $gte: weeklyStart} } },
                    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
                    { $sort: { _id: -1 } }
                ]),
                monthlyCalculations: await AnthropometricCalculation.aggregate([
                    { $match: { timestamp: { $gte: monthlyStart} } },
                    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
                    { $sort: { _id: -1 } }
                ]),
                yearlyCalculations: await AnthropometricCalculation.aggregate([
                    { $match: { timestamp: { $gte: yearlyStart } } },
                    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }, count: { $sum: 1 } } },
                    { $sort: { _id: -1 } }
                ]),
                anthropometricStats,
                totalFoodDiaryLogs: await FoodDiary.countDocuments(),
                weeklyFoodDiaryLogs: foodDiaryStats.weekly,
                monthlyFoodDiaryLogs: foodDiaryStats.monthly,
                yearlyFoodDiaryLogs: foodDiaryStats.yearly,
                mostUsedCalculators: mostUsedCalculators.map(calc => ({
                    name: calc._id,
                    count: calc.count,
                    trend: Math.random() * 100 // Replace this with an actual trend calculation
                })),
                topUsers: topUsers.map(user => ({
                    id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    usageCount: user.usage,
                    lastUsed: user.lastUsageDate
                }))
            });

        } catch (error) {
            console.error("Error fetching analytics:", error);
            return res.status(500).json({ success: false, message: "Error fetching analytics" });
        }
    }
}

module.exports = { AdminController };
