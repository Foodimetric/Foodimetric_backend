const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require('moment');

const { certainRespondMessage } = require("../utils/response");
const User = require("../models/user.models");
const Admin = require("../models/admin.models.js");
const FoodDiary = require("../models/diary.model.js");
const Message = require("../models/message.js");
const AnthropometricCalculation = require("../models/anthropometric.js");
const { OtpEmailService } = require("../services/OtpEmailService.js");
const Newsletter = require("../models/newsletter-subscription.model.js");
const { creditUsers } = require('../../credit_verified_users.js');


const otpService = new OtpEmailService();

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

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            admin.loginOtp = otp;
            admin.otpExpiresAt = Date.now() + 5 * 60 * 1000;
            await admin.save();

            await otpService.OtpDetails(admin.email, otp);

            return res.json({ success: true, message: "OTP sent to email" });
        } catch (error) {
            console.error(err);
            return certainRespondMessage(res, false, "Server error", 500);
        }
    }

    async otpVerify(req, res) {
        const { email, otp } = req.body;

        try {
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(404).json({ success: false, message: "Admin not found" });
            }

            if (!admin.loginOtp || admin.loginOtp !== otp || Date.now() > admin.otpExpiresAt) {
                return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
            }

            // Clear OTP after verification
            admin.loginOtp = null;
            admin.otpExpiresAt = null;
            await admin.save();

            // Create token
            const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });

            return res.json({
                success: true,
                token,
                role: admin.role,
                name: admin.name,
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }

    async resendOtp(req, res) {
        const { email } = req.body;

        try {
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res.status(404).json({ success: false, message: "Invalid credentilas" });
            }

            // Generate new OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Save new OTP & expiry
            admin.loginOtp = otp;
            admin.otpExpiresAt = Date.now() + 5 * 60 * 1000;
            await admin.save();

            // Send new OTP via email
            await otpService.OtpDetails(email, otp);

            return res.json({ success: true, message: "New OTP sent to your email" });

        } catch (err) {
            console.error("Error resending OTP:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
    async getAnalytics(req, res) {
        try {
            const now = new Date();
            const getDailyCounts = (Model, dateField, limit = null) => {
                const pipeline = [
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } }
                ];
                if (limit) pipeline.push({ $limit: limit });
                return Model.aggregate(pipeline);
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
                User.find().select("firstName lastName email usage lastUsageDate location isVerified category googleId credits"),
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
            const { weeklySignupStat, monthlySignupStat, yearlySignupStat } = getAnalyticsBreakdown(dailyUsage);
            const { weeklyCalculations: weeklyFoodLogs, monthlyCalculations: monthlyFoodLogs, yearlyCalculations: yearlyFoodLogs } = getAnalyticsBreakdown(rawDailyFoodDiaryLogs);
            const newsletterSubscribers = await Newsletter.find()
                .sort({ createdAt: -1 })
                .select("email createdAt")
                .lean()
            const roleDistribution = await User.aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Format into a cleaner structure for categories 0–3
            const categories = { 0: 0, 1: 0, 2: 0, 3: 0 };
            roleDistribution.forEach(item => {
                categories[item._id] = item.count;
            });

            console.log("Weekly:", weeklySignupStat);
            console.log("Monthly:", monthlySignupStat);
            console.log("Yearly:", yearlySignupStat);
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
                newsletterSubscribers,
                roleDistribution: categories,
                weeklySignupStat,
                yearlySignupStat,
                monthlySignupStat
            });

        } catch (error) {
            console.error("Error fetching analytics:", error);
            return res.status(500).json({ success: false, message: "Error fetching analytics" });
        }
    }

    async getAllMessages(req, res) {
        try {
            const messages = await Message.find()
                .select("text createdAt user_id")
                .populate("user_id", "firstName lastName email") // fetch user details
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: messages.length,
                messages: messages.map(msg => ({
                    id: msg._id,
                    text: msg.text,
                    createdAt: msg.createdAt,
                    user: {
                        id: msg.user_id._id,
                        name: `${msg.user_id.firstName || ""} ${msg.user_id.lastName || ""}`.trim(),
                        email: msg.user_id.email
                    }
                }))
            });
        } catch (error) {
            console.error("Error fetching messages:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to retrieve messages",
            });
        }
    }

    async creditVerifiedUsers(req, res) {
        try {
            const updated = await creditUsers();
            res.status(200).json({
                message: `Successfully reset credits to 1000 for ${updated.modifiedCount} verified users.`,
            });
        } catch (error) {
            console.error("Error resetting credits:", error);
            res.status(500).json({
                error: "Failed to reset credits. Please try again.",
            });
        }
    }

    async updateUserCredit(req, res) {
        try {
            const { email, credit } = req.body;

            // Validate request body
            if (!email || credit === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Email and credit are required",
                });
            }

            // Ensure credit is a number
            const parsedCredit = Number(credit);
            if (isNaN(parsedCredit) || parsedCredit < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Credit must be a non-negative number",
                });
            }

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Check if verified
            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "User is not verified",
                });
            }

            // Update credits
            user.credits = parsedCredit;
            await user.save();

            return res.status(200).json({
                success: true,
                message: "User credit updated successfully",
                user: {
                    email: user.email,
                    credits: user.credits,
                },
            });

        } catch (error) {
            console.error("Error updating user credit:", error);
            return res.status(500).json({
                success: false,
                message: "Server error while updating credit",
            });
        }
    }
}

module.exports = { AdminController };