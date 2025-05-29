// scripts/credit_verified_users.js
const User = require("./src/models/user.models");


const creditUsers = async () => {
    try {

        const updated = await User.updateMany(
            { isVerified: true },
            { $set: { credits: 1000 } }
        );
        console.log(`Updated ${updated.modifiedCount} users.`);
    } catch (error) {
        console.error("Error updating credit to Users:", error);
    }

}

module.exports = { creditUsers }

