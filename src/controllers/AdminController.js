const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require('moment');

const { certainRespondMessage } = require("../utils/response");
const User = require("../models/user.models");
const Admin = require("../models/admin.models.js");
const FoodDiary = require("../models/diary.model.js");
const AnthropometricCalculation = require("../models/anthropometric.js");
const Newsletter = require("../models/newsletter-subscription.model.js");


function getAnalyticsBreakdown(dailyCalculations) {
    const weeklyMap = new Map();
    const monthlyMap = new Map();
    const yearlyMap = new Map();

    const sorted = dailyCalculations.sort((a, b) => new Date(a._id) - new Date(b._id));

    sorted.forEach(entry => {
        const date = moment(entry._id);
        const year = date.year();
        const monthKey = date.format('MMMM YYYY');

        if (!yearlyMap.has(year)) yearlyMap.set(year, 0);
        yearlyMap.set(year, yearlyMap.get(year) + entry.count);

        if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, 0);
        monthlyMap.set(monthKey, monthlyMap.get(monthKey) + entry.count);

        const startOfWeek = date.clone().startOf('isoWeek');
        const endOfWeek = date.clone().endOf('isoWeek');
        // const weekKey = `${startOfWeek.format('MMM D')}–${endOfWeek.format('MMM D')}, ${year}`;
        const weekKey = `Week ${date.isoWeek()} of ${year}`;

        if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, 0);
        weeklyMap.set(weekKey, weeklyMap.get(weekKey) + entry.count);
    });

    return {
        weeklyCalculations: Array.from(weeklyMap.entries()).map(([range, count], index) => ({
            week: `Week ${index + 1}: ${range}`,
            count
        })),
        monthlyCalculations: Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count })),
        yearlyCalculations: Array.from(yearlyMap.entries()).map(([year, count]) => ({ year, count }))
    };
}

class AdminController {
    async login(req, res) {
        const { email, password } = req.body;

        try {
            const admin = await Admin.findOne({ email });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                return certainRespondMessage(res, false, "Invalid credentials", 401);
            }

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
            return certainRespondMessage(res, false, "Server error", 500);
        }
    }

    async getAnalytics(req, res) {
        try {
            const now = new Date();

            const getDailyCounts = (Model, dateField, limit = 30) => {
                return Model.aggregate([
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } },
                    { $limit: limit }
                ]);
            };

            const getTimeFrameCounts = async (Model, dateField) => ({
                weekly: await Model.countDocuments({ [dateField]: { $gte: new Date(now - 7 * 86400000) } }),
                monthly: await Model.countDocuments({ [dateField]: { $gte: new Date(new Date().setMonth(now.getMonth() - 1)) } }),
                yearly: await Model.countDocuments({ [dateField]: { $gte: new Date(new Date().setFullYear(now.getFullYear() - 1)) } }),
            });

            const [
                userCalculations,
                dailySignups,
                dailyUsage,
                dailyCalculations,
                rawDailyFoodDiaryLogs,
                anthropometricStats,
                totalAnthropometricCalculations,
                totalUsers,
                allUsers,
                topUsers,
                topLocations,
                mostUsedCalculators,
                totalFoodDiaryLogs
            ] = await Promise.all([
                AnthropometricCalculation.aggregate([
                    {
                        $group: {
                            _id: {
                                user: "$user_id",
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
                            },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: "$_id.user",
                            calculations: { $push: { date: "$_id.date", count: "$count" } },
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
                            totalCalculations: "$totalCalculations",
                            calculations: "$calculations"
                        }
                    },
                    { $sort: { totalCalculations: -1 } }
                ]),
                getDailyCounts(User, "createdAt"),
                User.aggregate([
                    { $match: { lastUsageDate: { $ne: null } } },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastUsageDate" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } },
                    { $limit: 30 }
                ]),
                getDailyCounts(AnthropometricCalculation, "timestamp"),
                getDailyCounts(FoodDiary, "createdAt"),
                getTimeFrameCounts(AnthropometricCalculation, "timestamp"),
                AnthropometricCalculation.countDocuments(),
                User.countDocuments(),
                User.find().select("firstName lastName email usage lastUsageDate location isVerified category googleId"),
                User.find().sort({ usage: -1 }).limit(10).select("firstName lastName email usage lastUsageDate"),
                User.aggregate([
                    { $match: { location: { $ne: null, $ne: "" } } },
                    { $group: { _id: "$location", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]),
                AnthropometricCalculation.aggregate([
                    { $group: { _id: "$calculator_name", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 }
                ]),
                FoodDiary.countDocuments(),
            ]);

            const { weeklyCalculations, monthlyCalculations, yearlyCalculations } = getAnalyticsBreakdown(dailyCalculations);
            const { weeklyCalculations: weeklyFoodLogs, monthlyCalculations: monthlyFoodLogs, yearlyCalculations: yearlyFoodLogs } = getAnalyticsBreakdown(rawDailyFoodDiaryLogs);
            // const newsletterSubscribers = Newsletter.find().sort({ createdAt: -1 }).select("email createdAt")
            const newsletterSubscribers = await Newsletter.find()
                .sort({ createdAt: -1 })
                .select("email createdAt")
                .lean()
            return res.json({
                totalUsers,
                totalAnthropometricCalculations,
                totalFoodDiaryLogs,

                userCalculations,
                allUsers,
                topUsers: topUsers.map(user => ({
                    id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    usageCount: user.usage,
                    lastUsed: user.lastUsageDate,
                })),
                topLocations,

                dailySignups,
                dailyUsage,
                dailyCalculations,

                weeklyCalculations,
                monthlyCalculations,
                yearlyCalculations,

                anthropometricStats,
                foodDiaryStats: {
                    daily: rawDailyFoodDiaryLogs.reverse(),
                    weekly: weeklyFoodLogs,
                    monthly: monthlyFoodLogs,
                    yearly: yearlyFoodLogs,
                },

                mostUsedCalculators: mostUsedCalculators.map(calc => ({
                    name: calc._id,
                    count: calc.count,
                    trend: null
                })),
                newsletterSubscribers
            });

        } catch (error) {
            console.error("Error fetching analytics:", error);
            return res.status(500).json({ success: false, message: "Error fetching analytics" });
        }
    }
}

module.exports = { AdminController };