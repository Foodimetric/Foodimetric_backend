const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { certainRespondMessage } = require("../utils/response");
// const User = require("../models/user.models");
const Admin = require("../models/admin.models.js");
// const FoodDiary = require("../models/FoodDiary");
// const Analytics = require("../models/Analytics");
// const CalculatorUsage = require("../models/CalculatorUsage");

class AdminController {
    async login(req, res) {
        const { email, password } = req.body;

        try {
            // Find admin by email (allowing both "admin" and "super-admin")
            const admin = await Admin.findOne({ email });

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
        // try {
        //     // Daily usage analytics
        //     const dailyUsage = await Analytics.find({}).sort({ date: -1 }).limit(30);

        //     // Total food diary logs
        //     const totalFoodDiaryLogs = await FoodDiary.countDocuments();

        //     // Most used anthropometric calculators
        //     const mostUsedCalculators = await CalculatorUsage.aggregate([
        //         { $group: { _id: "$calculatorName", count: { $sum: 1 } } },
        //         { $sort: { count: -1 } },
        //         { $limit: 5 },
        //     ]);

        //     // Top 10 active users
        //     const topUsers = await User.find().sort({ analytics: -1 }).limit(10).select("name analytics");

        //     // Top profession
        //     const professionData = await User.aggregate([
        //         { $group: { _id: "$profession", count: { $sum: 1 } } },
        //         { $sort: { count: -1 } },
        //         { $limit: 1 },
        //     ]);

        //     // Top locations
        //     const topLocations = await User.aggregate([
        //         { $group: { _id: "$location", count: { $sum: 1 } } },
        //         { $sort: { count: -1 } },
        //         { $limit: 5 },
        //     ]);

        //     return res.json({
        //         dailyUsage,
        //         totalFoodDiaryLogs,
        //         mostUsedCalculators: mostUsedCalculators.map(calc => ({
        //             name: calc._id,
        //             count: calc.count,
        //         })),
        //         topUsers: topUsers.map(user => ({ name: user.name, usageCount: user.analytics })),
        //         topProfession: professionData.length > 0 ? professionData[0]._id : "Unknown",
        //         topLocations: topLocations.map(loc => ({ name: loc._id, count: loc.count })),
        //     });
        // } catch (error) {
        //     return res.status(500).json(certainRespondMessage("Error fetching analytics", false));
        // }
    }
}

module.exports = { AdminController };
