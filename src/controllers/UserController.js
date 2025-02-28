const User = require("../models/user.models")
const Anthro = require("../models/anthropometric")
const Diary = require("../models/diary.model")
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
        const content = req.body
        console.log(content)
        content.category = content.category || 0;
        let result = await userRepository.signUp(content)
        console.log(result)
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
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

    async verifyUser(req, res) {
        try {
            const { token } = req.params;
            if (!token) {
                certainRespondMessage(res, null, "No Token Parsed", 400)
            }
            let result = await userRepository.verifyUser(token);
            if (!result) {
                certainRespondMessage(res, null, "Invalid Token", 400)
            }
            certainRespondMessage(res, result.payload, result.message, 200)
        }
        catch (err) {
            certainRespondMessage(res, null, err.message, err.status)
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

    async signUpWithGoogle(profile) {
        const { id, displayName, emails } = profile; // Google profile details

        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: id });

            if (!user) {
                user = new User({
                    email: emails[0].value,
                    googleId: id,
                    firstName: displayName.split(" ")[0] || "", // Extract first name
                    lastName: displayName.split(" ")[1] || "", // Extract last name (if available)
                    password: null, // No password for Google users
                    category: 0, // Default category
                    isVerified: true, // Mark Google users as verified
                });

                user = await user.save(); // Save the new user
            }

            return {
                message: "Google Sign-Up Successful",
                payload: user,
            };
        } catch (error) {
            throw new Error("Error during Google Sign-Up: " + error.message);
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

            // Fetch the user's analytics data
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const today = new Date();
            const lastUsageDate = user.lastUsageDate;

            if (lastUsageDate && new Date(lastUsageDate).toDateString() === today.toDateString()) {
                return res.status(200).json({ message: "Platform usage already recorded for today." });
            }

            // Increment usage and update lastUsageDate
            user.usage += 1;
            user.lastUsageDate = today;

            await user.save();

            res.status(200).json({ message: "Platform usage updated successfully." });
        } catch (error) {
            res.status(500).json({ message: "Error updating platform usage.", error: error.message });
        }
    }

    async sendEmail(name, email, address, service, note) {
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
    
        await transporter.sendMail(mailOptions);
    }

    async contact(req, res) {
        try {
            const { name, email, address, service, note } = req.body;
    
            if (!name || !email || !address || !service || !note) {
                return certainRespondMessage(res, null, "All fields are required", 400);
            }
    
            // Example: Save to the database (if you have a Contact model)
            const contactMessage = new Contact({ name, email, address, service, note });
            await contactMessage.save();
            await sendEmail(name, email, address, service, note);
    
            return certainRespondMessage(res, null, "Message received successfully", 200);
        } catch (error) {
            console.error("Error in contact function:", error); // Log the error
            return certainRespondMessage(res, null, `Failed to send message: ${error.message}`, 500);
        }
    } 
}




module.exports = {
    UserController
}