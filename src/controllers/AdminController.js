const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const moment = require("moment");

const { certainRespondMessage } = require("../utils/response");
const User = require("../models/user.models");
const Admin = require("../models/admin.models.js");
const FoodDiary = require("../models/diary.model.js");
const Message = require("../models/message.js");
const SystemSetting = require("../models/systemSetting.model.js");
const ActivityLog = require("../models/activityLog.model.js");
const Usage = require("../models/usage.model.js");
const AnthropometricCalculation = require("../models/anthropometric.js");
const { OtpEmailService } = require("../services/OtpEmailService.js");
const Newsletter = require("../models/newsletter-subscription.model.js");
const { creditUsers } = require("../../credit_verified_users.js");

const otpService = new OtpEmailService();

/* ------------------ 📌 Shared Helpers ------------------ */

// Reusable error responder
const handleError = (res, error, message = "Server error", status = 500) => {
    // eslint-disable-next-line no-console
    console.error(message, error);
    return res.status(status).json({ success: false, message });
};

const formatWeekKey = (date) => {
    const year = date.year();
    return `Week ${date.isoWeek()} of ${year}`;
};

// Generic breakdown function for daily data [{ _id: 'YYYY-MM-DD', count: Number }]
function computeBreakdown(dailyData) {
    const weeklyMap = new Map();
    const monthlyMap = new Map();
    const yearlyMap = new Map();

    const sorted = [...dailyData].sort(
        (a, b) => new Date(a._id).getTime() - new Date(b._id).getTime()
    );

    sorted.forEach((entry) => {
        const date = moment(entry._id);
        const year = date.year();
        const monthKey = date.format("MMMM YYYY");
        const weekKey = formatWeekKey(date);

        yearlyMap.set(year, (yearlyMap.get(year) || 0) + entry.count);
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + entry.count);
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + entry.count);
    });

    return {
        weekly: Array.from(weeklyMap.entries()).map(([week, count], index) => ({
            week: `Week ${index + 1}: ${week}`,
            count,
        })),
        monthly: Array.from(monthlyMap.entries()).map(([month, count]) => ({
            month,
            count,
        })),
        yearly: Array.from(yearlyMap.entries()).map(([year, count]) => ({
            year,
            count,
        })),
    };
}

// Generate and send OTP
async function generateAndSendOtp(admin, email) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.loginOtp = otp;
    admin.otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await admin.save();
    // await otpService.OtpDetails(email, otp);
    return otp;
}

// Build a daily counts aggregation for a given model/date field
function buildDailyCountsAggregation(dateField) {
    const dateExpr = `$${dateField}`;
    return [
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: dateExpr } },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: -1 } },
    ];
}

// Count time windows (7d / 1m / 1y) for a model/date field
async function getTimeFrameCounts(Model, dateField) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const oneMonthAgo = new Date(new Date(now).setMonth(now.getMonth() - 1));
    const oneYearAgo = new Date(new Date(now).setFullYear(now.getFullYear() - 1));

    const [weekly, monthly, yearly] = await Promise.all([
        Model.countDocuments({ [dateField]: { $gte: sevenDaysAgo } }),
        Model.countDocuments({ [dateField]: { $gte: oneMonthAgo } }),
        Model.countDocuments({ [dateField]: { $gte: oneYearAgo } }),
    ]);

    return { weekly, monthly, yearly };
}

class AdminController {
    async login(req, res) {
        const { email, password } = req.body;

        try {
            const admin = await Admin.findOne({ email });
            console.log("admin", admin, await bcrypt.compare(password, admin.password));
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                return certainRespondMessage(res, false, "Invalid credentials", 401);
            }

            const otp = await generateAndSendOtp(admin, admin.email);
            return res.json({ success: true, message: `OTP sent : ${otp}` });
        } catch (error) {
            return certainRespondMessage(res, false, "Server error", 500);
        }
    }

    async otpVerify(req, res) {
        const { email, otp } = req.body;

        try {
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res
                    .status(404)
                    .json({ success: false, message: "Admin not found" });
            }

            const isInvalid =
                !admin.loginOtp ||
                admin.loginOtp !== otp ||
                (admin.otpExpiresAt && Date.now() > admin.otpExpiresAt);

            if (isInvalid) {
                return res
                    .status(400)
                    .json({ success: false, message: "Invalid or expired OTP" });
            }

            // Clear OTP after verification
            admin.loginOtp = null;
            admin.otpExpiresAt = null;
            await admin.save();

            // Create token
            const token = jwt.sign(
                { id: admin._id, role: admin.role },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.json({
                success: true,
                token,
                role: admin.role,
                name: admin.name,
                admin_id: admin._id,
            });
        } catch (error) {
            return handleError(res, error, "Server error", 500);
        }
    }

    async resendOtp(req, res) {
        const { email } = req.body;

        try {
            const admin = await Admin.findOne({ email });
            if (!admin) {
                return res
                    .status(404)
                    .json({ success: false, message: "Invalid credentials" });
            }

            await generateAndSendOtp(admin, email);
            return res.json({ success: true, message: "New OTP sent to your email" });
        } catch (error) {
            return handleError(res, error, "Error resending OTP", 500);
        }
    }

    async getAnalytics(req, res) {
        try {
            const [
                // Per-user daily calc counts & totals with user details
                userCalculations,
                // Daily signups (User.createdAt)
                dailySignups,
                // Daily anthropometric calculations
                dailyCalculations,
                // Daily food diary logs
                rawDailyFoodDiaryLogs,
                // Timeframe counts for anthropometrics
                anthropometricStats,
                // Totals and lists
                totalAnthropometricCalculations,
                totalUsers,
                topUsers,
                // Top locations
                topLocations,
                // Most used calculators
                mostUsedCalculators,
                // Total diary logs
                totalFoodDiaryLogs,
                dailyUsage,          // <--- NEW
                usageStats
            ] = await Promise.all([
                // Per-user totals with dates
                AnthropometricCalculation.aggregate([
                    {
                        $group: {
                            _id: {
                                user: "$user_id",
                                date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                            },
                            count: { $sum: 1 },
                        },
                    },
                    {
                        $group: {
                            _id: "$_id.user",
                            calculations: { $push: { date: "$_id.date", count: "$count" } },
                            totalCalculations: { $sum: "$count" },
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id",
                            foreignField: "_id",
                            as: "userDetails",
                        },
                    },
                    { $unwind: "$userDetails" },
                    {
                        $project: {
                            _id: 0,
                            userId: "$userDetails._id",
                            name: {
                                $concat: [
                                    { $ifNull: ["$userDetails.firstName", ""] },
                                    " ",
                                    { $ifNull: ["$userDetails.lastName", ""] },
                                ],
                            },
                            totalCalculations: "$totalCalculations",
                            calculations: "$calculations",
                        },
                    },
                    { $sort: { totalCalculations: -1 } },
                ]),

                // Daily signups
                User.aggregate(buildDailyCountsAggregation("createdAt")),

                // Daily anthropometric calculations
                AnthropometricCalculation.aggregate(
                    buildDailyCountsAggregation("timestamp")
                ),

                // Daily food diary logs
                FoodDiary.aggregate(buildDailyCountsAggregation("timestamp")),

                // Time window counts for anthropometrics
                getTimeFrameCounts(AnthropometricCalculation, "timestamp"),

                // Totals and lists
                AnthropometricCalculation.countDocuments(),
                User.countDocuments(),
                User.find()
                    .sort({ usage: -1 })
                    .limit(10)
                    .select("firstName lastName email usage lastUsageDate"),

                // Top locations (non-empty)
                User.aggregate([
                    { $match: { location: { $ne: null, $ne: "" } } },
                    { $group: { _id: "$location", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),

                // Most used calculators
                AnthropometricCalculation.aggregate([
                    { $group: { _id: "$calculator_name", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 5 },
                ]),

                // Total diary logs
                FoodDiary.countDocuments(),
                Usage.aggregate(buildDailyCountsAggregation("timestamp")),
                getTimeFrameCounts(Usage, "timestamp"),
            ]);

            // Compute breakdowns (signup, calculations, food logs)
            const signupBreakdown = computeBreakdown(dailySignups);
            const calcBreakdown = computeBreakdown(dailyCalculations);
            const foodLogBreakdown = computeBreakdown(rawDailyFoodDiaryLogs);

            // Newsletter subscribers
            const newsletterSubscribers = await Newsletter.find()
                .sort({ createdAt: -1 })
                .select("email createdAt")
                .lean();

            // Role distribution (categories)
            const roleDistributionRaw = await User.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
            ]);

            const roleDistribution = { 0: 0, 1: 0, 2: 0, 3: 0 };
            roleDistributionRaw.forEach((item) => {
                roleDistribution[item._id] = item.count;
            });

            const usageBreakdown = computeBreakdown(dailyUsage);

            const allUsers = await User.aggregate([
                {
                    $project: {
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        usage: 1,
                        lastUsageDate: 1,
                        location: 1,
                        isVerified: 1,
                        category: 1,
                        googleId: 1,
                        credits: 1,
                        healthProfile: 1,
                        streak: 1,
                        longestStreak: 1,
                        status: 1,
                        notifications: 1,
                        partner: 1,
                        partnerInvites: 1,
                        fcmTokens: 1
                    }
                },
                // Lookup latest calculation
                {
                    $lookup: {
                        from: "anthropometriccalculations",
                        let: { userId: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
                            { $sort: { timestamp: -1 } },  // latest first
                            { $limit: 1 }
                        ],
                        as: "latestCalculation"
                    }
                },
                { $unwind: { path: "$latestCalculation", preserveNullAndEmptyArrays: true } },
                // Lookup latest food log
                {
                    $lookup: {
                        from: "diaries",
                        let: { userId: "$_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$user_id", "$$userId"] } } },
                            { $sort: { timestamp: -1 } }, // Sorts by timestamp, placing missing timestamps last
                            { $limit: 3 } // Change this value to 3
                        ],
                        as: "latestFoodLogs" // Consider changing the alias to reflect a list
                    }
                },
                // { $unwind: { path: "$latestFoodLog", preserveNullAndEmptyArrays: true } }

                {
                    $lookup: {
                        from: "users", // The collection name for your User model is 'users'
                        localField: "partner", // The field on the current document to look up
                        foreignField: "_id", // The field on the 'users' collection to match against
                        as: "partnerDetails"
                    }
                },
                { $unwind: { path: "$partnerDetails", preserveNullAndEmptyArrays: true } },
                // Project the final output to include the partner's details
                {
                    $project: {
                        // Keep all existing fields
                        _id: 1, // Don't forget to re-add _id if you use $project a second time
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        usage: 1,
                        lastUsageDate: 1,
                        location: 1,
                        isVerified: 1,
                        category: 1,
                        googleId: 1,
                        credits: 1,
                        healthProfile: 1,
                        streak: 1,
                        longestStreak: 1,
                        status: 1,
                        notifications: 1,
                        partner: 1,
                        partnerInvites: 1,
                        fcmTokens: 1,
                        latestCalculation: 1,
                        latestFoodLogs: 1,
                        // Project the specific partner fields you need
                        "partnerDetails.firstName": 1,
                        "partnerDetails.email": 1
                    }
                }
            ]);

            return res.json({
                totalUsers,
                totalAnthropometricCalculations,
                totalFoodDiaryLogs,

                userCalculations,
                allUsers,

                topUsers: topUsers.map((user) => ({
                    id: user._id,
                    name: `${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim(),
                    usageCount: user.usage,
                    lastUsed: user.lastUsageDate,
                })),
                topLocations,

                dailySignups,
                dailyCalculations,

                // Calculations breakdown
                weeklyCalculations: calcBreakdown.weekly,
                monthlyCalculations: calcBreakdown.monthly,
                yearlyCalculations: calcBreakdown.yearly,

                // Anthropometric timeframe stats
                anthropometricStats,

                // Food diary stats (daily reversed to chronological ascending)
                foodDiaryStats: {
                    daily: [...rawDailyFoodDiaryLogs].reverse(),
                    weekly: foodLogBreakdown.weekly,
                    monthly: foodLogBreakdown.monthly,
                    yearly: foodLogBreakdown.yearly,
                },

                mostUsedCalculators: mostUsedCalculators.map((calc) => ({
                    name: calc._id,
                    count: calc.count,
                    trend: null,
                })),

                newsletterSubscribers,
                roleDistribution,

                // Signup breakdowns
                weeklySignupStat: signupBreakdown.weekly,
                monthlySignupStat: signupBreakdown.monthly,
                yearlySignupStat: signupBreakdown.yearly,
                dailyUsage,
                weeklyUsage: usageBreakdown.weekly,
                monthlyUsage: usageBreakdown.monthly,
                yearlyUsage: usageBreakdown.yearly,
            });
        } catch (error) {
            return handleError(res, error, "Error fetching analytics", 500);
        }
    }

    async getAllMessages(req, res) {
        try {
            const messages = await Message.find()
                .select("text createdAt user_id")
                .populate("user_id", "firstName lastName email")
                .sort({ createdAt: -1 });

            const mapped = messages.map((msg) => {
                const first = (msg.user_id?.firstName || "").trim();
                const last = (msg.user_id?.lastName || "").trim();
                const fullName = `${first} ${last}`.trim();

                return {
                    id: msg._id,
                    text: msg.text,
                    createdAt: msg.createdAt,
                    user: {
                        id: msg.user_id?._id || null,
                        name: fullName,
                        email: msg.user_id?.email || null,
                    },
                };
            });

            return res.status(200).json({
                success: true,
                count: mapped.length,
                messages: mapped,
            });
        } catch (error) {
            return handleError(res, error, "Failed to retrieve messages", 500);
        }
    }

    async creditVerifiedUsers(req, res) {
        try {
            const updated = await creditUsers();
            return res.status(200).json({
                message: `Successfully reset credits to 1000 for ${updated.modifiedCount} verified users.`,
            });
        } catch (error) {
            return handleError(res, error, "Failed to reset credits. Please try again.", 500);
        }
    }

    async updateUserCredit(req, res) {
        try {
            const { email, credit } = req.body;

            if (!email || credit === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Email and credit are required",
                });
            }

            const parsedCredit = Number(credit);
            if (Number.isNaN(parsedCredit) || parsedCredit < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Credit must be a non-negative number",
                });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "User is not verified",
                });
            }

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
            return handleError(res, error, "Server error while updating credit", 500);
        }
    }

    async suspendUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { status: "suspended" },
                { new: true }
            );
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json({ message: "User suspended successfully", user });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    async activateUser(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.id,
                { status: "active" },
                { new: true }
            );
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json({ message: "User activated successfully", user });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json({ message: "User deleted successfully" });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };
    // Create Admin (Only Super Admin allowed)
    async createAdmin(req, res) {
        try {
            // Check if requester is super-admin
            if (req.user.role !== "super-admin") {
                return res.status(403).json({ message: "Access denied. Only super-admins can create admins." });
            }

            const { name, email, password, role } = req.body;

            // Prevent creating another super-admin accidentally
            if (role === "super-admin") {
                return res.status(400).json({ message: "You cannot create another super-admin." });
            }

            // Check if email already exists
            const existingAdmin = await Admin.findOne({ email });
            if (existingAdmin) {
                return res.status(400).json({ message: "Admin with this email already exists." });
            }

            // Create new admin
            const newAdmin = new Admin({
                name,
                email,
                password,
                role: role || "admin",
            });

            await newAdmin.save();

            res.status(201).json({
                message: "Admin created successfully.",
                admin: {
                    id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role,
                },
            });
        } catch (error) {
            res.status(500).json({ message: "Error creating admin.", error: error.message });
        }
    };

    async toggleMaintenance(req, res) {
        try {
            const { enabled } = req.body; // true or false
            let setting = await SystemSetting.findOne({ key: "maintenanceMode" });

            if (!setting) {
                setting = new SystemSetting({ key: "maintenanceMode", value: enabled });
            } else {
                setting.value = enabled;
            }

            await setting.save();

            return res.json({
                success: true,
                message: `Maintenance mode ${enabled ? "enabled" : "disabled"} successfully.`,
                value: setting.value
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async logActivity(req, res) {
        const { user, role, action, meta } = req.body;
        try {
            await ActivityLog.create({
                user,
                role,
                action,
                meta
            });
            res.json({ success: true, message: "Settings updated successfully" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getActivityLogs(req, res) {
        try {
            const logs = await ActivityLog.find()
                .populate("user", "name email")
                .sort({ createdAt: -1 });

            res.json({ success: true, logs });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async resetInactiveStreaks(req, res) {
        try {
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 2);

            console.log(`Resetting streaks for users inactive since: ${startOfYesterday}`);
            // This query finds users who have been inactive for MORE than one day.
            // It's more efficient as it offloads the filtering to the database.
            const usersToReset = await User.find({
                lastLogDate: { $lt: startOfYesterday },
                streak: { $ne: 0 }
            });

            console.log(`Found ${usersToReset.length} users to reset streaks for.`);

            const bulkOps = usersToReset.map(user => {
                return {
                    updateOne: {
                        filter: { _id: user._id },
                        update: { $set: { streak: 0 } }
                    }
                };
            });

            if (bulkOps.length > 0) {
                await User.bulkWrite(bulkOps);
                console.log(`Successfully reset streaks for ${bulkOps.length} users.`);
                return res.status(200).json({
                    message: `Successfully reset streaks for ${bulkOps.length} users.`,
                    resetCount: bulkOps.length
                });
            } else {
                console.log('No user streaks needed to be reset today.');
                return res.status(200).json({
                    message: 'No user streaks needed to be reset today.',
                    resetCount: 0
                });
            }

        } catch (error) {
            console.error("Error resetting inactive streaks:", error);
            return res.status(500).json({ message: "Error resetting inactive streaks.", error: error.message });
        }
    };
}

module.exports = { AdminController };