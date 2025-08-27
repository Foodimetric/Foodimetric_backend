const User = require("../models/user.models")
const Anthro = require("../models/anthropometric")
const Diary = require("../models/diary.model")
const Usage = require("../models/usage.model")
const { PartnerInviteEmailService } = require("../services/PartnerInviteEmailService")
const Contact = require("../models/contact.model");
const UserRepository = require("../repositories/UserRepository");
const { certainRespondMessage } = require("../utils/response");
const nodemailer = require("nodemailer");


const getUser = async (id, res) => {
    try {
        let result = await userRepository.getUserById(id)
        if (result.payload) {
            certainRespondMessage(res, result.payload, result.message, result.responseStatus)
        }
        else {
            result = {
                message: "User not found",
                responseStatus: 404
            }
            certainRespondMessage(res, result.payload, result.message, result.responseStatus)
        }
    }
    catch (err) {
        let result = {
            message: "User not found",
            responseStatus: 404
        }
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }
}

const userRepository = new UserRepository()
class UserController {

    async signIn(req, res) {
        const { email, password } = req.body
        console.log({ email, password })
        let result = await userRepository.signIn(email, password)
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }
    async signUp(req, res) {
        const { referralId } = req.body;
        const content = req.body;

        // Set category to 0 if it's not provided
        content.category = content.category || 0;

        // Call the userRepository.signUp function and get the result
        let result = await userRepository.signUp(content);

        // Extract the new user object from the result payload
        const newUser = result.payload;

        const validReferralId = referralId && referralId !== 'null' ? referralId : null;
        // Only proceed with linking if a referralId exists AND the new user was created successfully
        if (validReferralId && newUser) {
            try {
                // Find the sender
                const sender = await User.findById(referralId);

                // Link both users as partners if the sender exists and doesn't already have a partner
                if (sender && !sender.partner) {
                    await User.bulkWrite([
                        {
                            updateOne: {
                                filter: { _id: newUser._id },
                                update: { $set: { partner: sender._id } },
                            },
                        },
                        {
                            updateOne: {
                                filter: { _id: sender._id },
                                update: {
                                    $set: { partner: newUser._id },
                                    $pull: { partnerInvites: { from: newUser._id } }
                                },
                            },
                        },
                    ]);
                    console.log(`Partner relationship established between ${sender.firstName} and ${newUser.firstName}`);
                }
            } catch (err) {
                console.error("Error linking partner accounts:", err);
            }
        }

        certainRespondMessage(res, result.payload, result.message, result.responseStatus);
    }

    async saveFcmToken(req, res) {
        try {
            const { userId, token } = req.body;

            if (!userId || !token) {
                return certainRespondMessage(res, null, "Missing userId or fcm token", 400);
            }

            // Add the token to the array if it doesn't already exist
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { fcmTokens: token } }, // $addToSet prevents duplicates
                { new: true }
            );

            if (!updatedUser) {
                return certainRespondMessage(res, null, "User not found", 404);
            }

            return certainRespondMessage(res, updatedUser, "Token saved successfully", 200);

        } catch (err) {
            console.error("Error saving FCM token:", err);
            return certainRespondMessage(res, null, "Internal server error", 500);
        }
    }

    async getUserById(req, res) {
        const { id } = req.params;
        getUser(id, res)
    }

    async getLoggedUser(req, res) {
        const id = req.user._id
        getUser(id, res)
    }

    async updateProfile(req, res) {
        console.log('we are getting called ');
        const update = req.body;
        const user = req.user

        if (req.file) {
            console.log('who called ');
            // If the profile picture exists in the request, update the profile with the image URL
            update.profilePicture = `/uploads/${req.file.filename}`;
        }
        console.log('oops ');
        let result = await userRepository.editProfile(update, user)
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }
    async deductCredit(req, res) {
        try {
            const userId = req.user._id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.credits <= 0) {
                return res.status(400).json({ message: "Insufficient credits" });
            }

            user.credits -= 1;
            await user.save();

            return res.status(200).json({
                message: "1 credit deducted successfully",
                remainingCredits: user.credits
            });
        } catch (error) {
            return res.status(500).json({
                message: "Error deducting credit",
                error: error.message
            });
        }
    }
    async verifyUser(req, res) {
        try {
            const { token } = req.params; // assuming /verify/:token
            const { email } = req.body;   // or req.query, depending on how the form submits

            // If token is present, verify with token
            if (token) {
                let result = await userRepository.verifyUser(token);
                if (!result) {
                    return certainRespondMessage(res, null, "Invalid Token", 400);
                }
                return certainRespondMessage(res, result.payload, result.message, 200);
            }

            // If email is present (no token), resend verification email
            if (email) {
                let result = await userRepository.resendVerificationEmail(email);
                if (!result) {
                    return certainRespondMessage(res, null, "User not found,Kindly check your email", 400);
                }
                return certainRespondMessage(res, null, result.message, 200);
            }

            // Neither token nor email present
            return certainRespondMessage(res, null, "No Token or Email Provided", 400);

        } catch (err) {
            certainRespondMessage(res, null, err.message, err.status || 500);
        }
    }

    async getAllUserEmails(req, res) {
        try {
            let result = await userRepository.getAllUserEmails();
            certainRespondMessage(res, result.payload, result.message, result.responseStatus);
        } catch (err) {
            certainRespondMessage(res, null, "Error fetching user emails", 500);
        }
    }

    async deleteAccount(req, res) {
        const userId = req.user._id; // Assuming `req.user` is populated with the authenticated user's details

        try {
            const result = await userRepository.deleteUserById(userId);
            certainRespondMessage(res, null, result.message, result.responseStatus);
        } catch (err) {
            certainRespondMessage(res, null, "Error deleting account", 500);
        }
    }


    async forgotPassword(req, res) {
        try {
            console.log('Request body:', req.body);
            const { email } = req.body;
            if (!email) {
                return certainRespondMessage(res, null, "Email is required", 400);
            }

            const user = await userRepository.getUserByEmail(email);
            if (!user) {
                return certainRespondMessage(res, null, "User not found", 404);
            }

            // For future enhancement: You can add email sending logic here.

            return certainRespondMessage(res, null, "User found", 200);
        } catch (error) {
            return certainRespondMessage(res, null, "Internal Server Error", 500);
        }
    }

    // Reset Password
    async resetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;

            if (!email || !newPassword) {
                return certainRespondMessage(res, null, "Email and new password are required", 400);
            }

            const result = await userRepository.updatePassword(email, newPassword);
            if (!result) {
                return certainRespondMessage(res, null, "User not found", 404);
            }

            return certainRespondMessage(res, null, "Password updated successfully", 200);
        } catch (error) {
            return certainRespondMessage(res, null, "Internal Server Error", 500);
        }
    }

    async getUserAnalytics(req, res) {
        try {
            const foodLogCount = await Diary.countDocuments({ user_id: req.user._id });

            // Count total anthropometric calculations in the Anthro collection for the specific user
            const totalCalculations = await Anthro.countDocuments({ user_id: req.user._id });

            // Find the most used anthropometric calculator for the specific user
            const mostUsedCalculator = await Anthro.aggregate([
                { $match: { user_id: req.user._id } }, // Filter by user_id
                { $group: { _id: "$calculator_name", count: { $sum: 1 } } }, // Group by calculator_name and count
                { $sort: { count: -1 } }, // Sort by count in descending order
                { $limit: 1 } // Get the top result
            ]);

            // Generate calculation breakdown for the pie chart (example)
            const calculationBreakdown = await Anthro.aggregate([
                { $match: { user_id: req.user._id } }, // Filter by user_id
                { $group: { _id: "$calculator_name", count: { $sum: 1 } } }, // Group by calculator_name
            ]);

            const user = await User.findById(req.user._id, "usage lastUsageDate");

            res.status(200).json({
                message: "Analytics fetched successfully",
                data: {
                    totalFoodLogs: foodLogCount,
                    totalCalculations,
                    mostUsedCalculator: mostUsedCalculator.length > 0 ? mostUsedCalculator[0]._id : 0,
                    platformUsage: user.usage || 0,
                    calculationBreakdown: calculationBreakdown,
                }
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching analytics",
                error: error.message,
            });
        }
    }

    async saveAnalytics(req, res) {
        try {
            const userId = req.user._id;

            // Ensure user exists
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Calculate today's date boundaries
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);

            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

            // Check if a usage record already exists for today
            const existingUsage = await Usage.findOne({
                userId,
                timestamp: { $gte: startOfToday, $lt: startOfTomorrow }
            });

            if (existingUsage) {
                return res
                    .status(200)
                    .json({ message: "Platform usage already recorded for today." });
            }

            // Create new usage record
            await Usage.create({ userId });

            // Increment usage and update lastUsageDate
            user.usage += 1;
            user.lastUsageDate = new Date();
            await user.save();

            return res
                .status(200)
                .json({ message: "Platform usage recorded successfully." });
        } catch (error) {
            return res.status(500).json({
                message: "Error updating platform usage.",
                error: error.message,
            });
        }
    }
    async contact(req, res) {
        try {
            const { name, email, address, service, note } = req.body;

            if (!name || !email || !address || !service || !note) {
                return certainRespondMessage(res, null, "All fields are required", 400);
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_ADDRESS, // Use environment variables for security
                    pass: process.env.EMAIL_TEST_PASSWORD,
                }
            });
            const mailOptions = {
                from: `"Foodimetric Contact" <${email}>`,
                to: "foodimetric@gmail.com",
                cc: ["follycube2020@gmail.com", "ademolaayomide121@gmail.com", "aderemioluwadamiola@gmail.com"], // Add CC recipients here
                subject: "New Contact Form Submission",
                html: `
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Address:</strong> ${address}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <p><strong>Message:</strong> ${note}</p>
                `
            };

            // Example: Save to the database (if you have a Contact model)
            const contactMessage = new Contact({ name, email, address, service, note });
            await contactMessage.save();
            await transporter.sendMail(mailOptions);

            return certainRespondMessage(res, null, "Message received successfully", 200);
        } catch (error) {
            console.error("Error in contact function:", error); // Log the error
            return certainRespondMessage(res, null, `Failed to send message: ${error.message}`, 500);
        }
    }

    async sendInvite(req, res) {
        try {
            const { email } = req.body;
            const senderId = req.user._id; // assuming you’re using auth middleware

            // check if sender already has a partner 
            const sender = await User.findById(senderId);
            if ((sender.email || "").toLowerCase() === email) {
                return res.status(400).json({ message: "You can't invite yourself" });
            }

            if (sender.partner) {
                return res.status(400).json({ message: "You already have an accountability partner." });
            }

            let receiver = await User.findOne({ email });


            if (!receiver) {
                // Generate referral link
                const referralLink = `https://foodimetric.com/register?ref=${senderId}`;

                // Send email
                const inviteService = new PartnerInviteEmailService();
                await inviteService.sendInvite(email, referralLink, sender.firstName || "A Foodimetric user");

                return res.status(200).json({
                    message: "User not found. Invite email sent with referral link.",
                    referralLink,
                });
            }

            // Check if receiver already has a partner
            if (receiver.partner) {
                return res.status(400).json({ message: "This user already has a partner." });
            }

            // Add invite to receiver
            receiver.partnerInvites.push({ from: senderId });
            await receiver.save();

            return res.status(200).json({ message: "Invite sent successfully." });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error sending invite." });
        }
    }

    async acceptInvite(req, res) {
        try {
            const { inviteId } = req.body;
            const userId = req.user._id;

            const user = await User.findById(userId).populate("partnerInvites.from");

            const invite = user.partnerInvites.id(inviteId);
            if (!invite) {
                return res.status(404).json({ message: "Invite not found." });
            }

            if (invite.status !== "pending") {
                return res.status(400).json({ message: "Invite already handled." });
            }

            const sender = await User.findById(invite.from);

            // Check if either already has a partner
            if (user.partner || sender.partner) {
                return res.status(400).json({ message: "One of you already has a partner." });
            }

            invite.status = "accepted";

            // Atomically update both users' documents
            const bulkOps = [
                // Update the accepting user
                {
                    updateOne: {
                        filter: { _id: userId },
                        update: {
                            $set: { partner: sender._id },
                            $pull: { partnerInvites: { _id: inviteId } } // Remove the accepted invite
                        }
                    }
                },
                // Update the sender
                {
                    updateOne: {
                        filter: { _id: sender._id },
                        update: {
                            $set: { partner: userId }
                        }
                    }
                }
            ];

            await User.bulkWrite(bulkOps);

            return res.status(200).json({ message: "Invite accepted. You are now partners!" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error accepting invite." });
        }
    };

    async rejectInvite(req, res) {
        try {
            const { inviteId } = req.body;
            const userId = req.user._id;

            const user = await User.findById(userId);
            const invite = user.partnerInvites.id(inviteId);

            if (!invite) {
                return res.status(404).json({ message: "Invite not found." });
            }
            const senderId = invite.from;

            console.log("log", senderId);


            invite.status = "rejected";
            const firstName = user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1);
            const bulkOps = [
                // Operation 1: Remove the invite from the recipient's invites array
                {
                    updateOne: {
                        filter: { _id: userId },
                        update: {
                            $pull: { partnerInvites: { _id: inviteId } }
                        }
                    }
                },
                // Operation 2: Add a notification to the sender's notifications array
                {
                    updateOne: {
                        filter: { _id: senderId },
                        update: {
                            $push: {
                                notifications: {
                                    type: 'invite_rejected',
                                    message: `Ah, ${firstName} no gree o! Your partner invitation has been declined.`
                                }
                            }
                        }
                    }
                }
            ];

            await User.bulkWrite(bulkOps);

            return res.status(200).json({ message: "Invite rejected." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Error rejecting invite." });
        }
    };

    // A new function to restore a user's streak for a fee.
    async restoreStreak(req, res) {
        try {
            const userId = req.user._id; // Assuming middleware has attached the user to the request
            const user = await User.findById(userId);

            // Check if the user exists
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            // Check if the user has enough credits to restore the streak
            const streakRestoreCost = 300;
            if (user.credits < streakRestoreCost) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient credits. You need ${streakRestoreCost} credits to restore your streak.`
                });
            }

            const today = new Date();
            // Normalize today's date to the start of the day for consistent calculations
            const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            console.log("Today's date (normalized):", todayDateOnly);
            console.log("User's last log date:", user.lastLogDate);

            let daysMissed = -1;

            if (user.lastLogDate) {
                // Normalize the last log date to the start of its day
                const lastLogDay = new Date(user.lastLogDate.getFullYear(), user.lastLogDate.getMonth(), user.lastLogDate.getDate());
                console.log("User's last log date (normalized):", lastLogDay);

                // Calculate the number of days passed since the last log
                const diffTime = todayDateOnly.getTime() - lastLogDay.getTime();
                console.log("Difference in time (ms):", diffTime);
                daysMissed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                console.log("Days missed:", daysMissed);
            } else {
                // User has never logged in before, no streak to restore
                return res.status(400).json({
                    success: false,
                    message: "You do not have a streak to restore."
                });
            }

            // Check if the user missed exactly one day (the number of days passed is 2)
            if (daysMissed === 2) {
                // Restore streak, deduct credits, and save
                user.streak += 1; // Increment the streak from its last value
                user.credits -= streakRestoreCost;
                user.lastLogDate = todayDateOnly; // Update last log date to today
                await user.save();

                return res.status(200).json({
                    success: true,
                    message: `Your streak has been successfully restored! A fee of ${streakRestoreCost} credits has been deducted.`,
                    payload: {
                        newStreak: user.streak,
                        newCredits: user.credits
                    }
                });
            } else if (daysMissed === 0 || daysMissed === 1) {
                return res.status(400).json({
                    success: false,
                    message: "Your streak is already active and does not need to be restored."
                });
            } else {
                // Missed more than one day, cannot restore
                // In a real-world scenario, you'd likely want to handle this differently
                // as the automated reset function will already set the streak to 0.
                user.streak = 0;
                await user.save();
                return res.status(400).json({
                    success: false,
                    message: `You missed ${daysMissed - 1} days. Your streak cannot be restored.`
                });
            }

        } catch (error) {
            console.error("Error restoring user streak:", error);
            return res.status(500).json({
                success: false,
                message: "An internal server error occurred."
            });
        }
    }

    // A new function to handle removing a streak partner.
    async removeStreakPartner(req, res) {
        try {
            const userId = req.user._id; // Assuming middleware has attached the user to the request
            const user = await User.findById(userId);

            // 1. Check if the user exists
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            // 2. Check if the user has a streak partner
            if (!user.partner) {
                return res.status(400).json({
                    success: false,
                    message: "You do not have a streak partner to remove."
                });
            }

            // Find the current partner's user document
            const partnerId = user.partner;
            const partnerUser = await User.findById(partnerId);

            // 3. Check if the partner exists (in case of data inconsistency)
            if (!partnerUser) {
                // If partner user is not found, just clear the user's partner field
                user.partner = null;
                await user.save();

                return res.status(404).json({
                    success: false,
                    message: "Partner not found. Your partnership has been removed."
                });
            }

            // 4. Remove the partnership from both user documents
            user.partner = null;
            partnerUser.partner = null;

            // 5. Create notifications for both users
            const userNotification = {
                type: 'partner_request',
                message: `Your partnership with ${partnerUser.firstName} has ended.`
            };
            const partnerNotification = {
                type: 'partner_request',
                message: `Your partnership with ${user.firstName} has ended.`
            };

            // Add the notifications to their respective arrays
            user.notifications.push(userNotification);
            partnerUser.notifications.push(partnerNotification);

            // Save both user documents in a single operation for consistency
            await Promise.all([user.save(), partnerUser.save()]);

            return res.status(200).json({
                success: true,
                message: `You have successfully ended your partnership with ${partnerUser.firstName}.`,
                payload: {
                    user: user,
                    partner: partnerUser
                }
            });

        } catch (error) {
            console.error("Error removing streak partner:", error);
            return res.status(500).json({
                success: false,
                message: "An internal server error occurred."
            });
        }
    }

    async markAllNotificationsAsRead(req, res) {

        const userId = req.user._id;

        // Find the user by their ID and update all notifications.
        // The $set operator is used to update fields within the notifications array.
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: { "notifications.$[elem].read": true }
            },
            {
                new: true, // Return the updated document
                arrayFilters: [{ "elem.read": false }] // Filter to update only unread notifications
            }
        );

        if (!updatedUser) {
            res.status(404);
            throw new Error("User not found.");
        }

        res.status(200).json({
            success: true,
            message: "All notifications marked as read.",
            user: updatedUser
        });
    };



}

module.exports = {
    UserController
}