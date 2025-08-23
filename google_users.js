const User = require("./src/models/user.models"); // Adjust the path to your User model

const verifyGoogleUsers = async () => {
    try {
        // Find all users who have a googleId and are not verified
        const usersToVerify = await User.find({
            googleId: { $exists: true, $ne: null },
            isVerified: false
        });

        if (usersToVerify.length === 0) {
            console.log("🤷‍♂️ No unverified Google users found.");
            return;
        }

        const userIdsToUpdate = usersToVerify.map(user => user._id);

        // Update all matched users to set isVerified to true
        const updateResult = await User.updateMany(
            { _id: { $in: userIdsToUpdate } },
            { $set: { isVerified: true } }
        );

        console.log(`🚀 Successfully verified ${updateResult.modifiedCount} users.`);
    } catch (error) {
        console.error("❌ An error occurred during the verification script:", error);
    }
};

module.exports = { verifyGoogleUsers }