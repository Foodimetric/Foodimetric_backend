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
    
            // **Send Response**
            return res.json({
                dailyUsage,
                dailyCalculations,
                dailyFoodDiaryLogs,
                anthropometricStats,
                foodDiaryStats,
                totalFoodDiaryLogs: await FoodDiary.countDocuments(),
                mostUsedCalculators: mostUsedCalculators.map(calc => ({ name: calc._id, count: calc.count })),
                topUsers: topUsers.map(user => ({
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    usageCount: user.usage,
                    lastUsed: user.lastUsageDate
                })),
                topLocations: topLocations.map(loc => ({ name: loc._id, count: loc.count }))
            });
    
        } catch (error) {
            console.error("Error fetching analytics:", error);
            return res.status(500).json({ success: false, message: "Error fetching analytics" });
        }
    }
}

module.exports = { AdminController };
