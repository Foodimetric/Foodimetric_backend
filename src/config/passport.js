const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.models"); // Your User model
const { WelcomeEmailService } = require("../services/WelcomeEmailServices");


const welcomeEmailService = new WelcomeEmailService();
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.URL + "/users/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("🔍 Checking user in DB...");
                // Find the user and populate the partner and partnerInvites details
                let user = await User.findOne({ email: profile.emails[0].value })
                    .populate({
                        path: 'partner',
                        select: 'firstName lastName email streak longestStreak' // Add streak and longestStreak here
                    })
                    .populate({
                        path: 'partnerInvites.from',
                        select: 'firstName lastName email'
                    });
                if (user) {
                    console.log("✅ User exists, updating Google ID...");
                    // If the user exists but doesn't have a googleId, update it
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.profilePicture = profile.photos[0]?.value || ""
                        user.isVerified = true
                        await user.save();
                    }
                    return done(null, user);
                }

                console.log("⚡ New user, creating entry in DB...");
                // Create a new user if no account exists
                user = new User({
                    firstName: profile.displayName.split(" ")[0] || "",
                    lastName: profile.displayName.split(" ")[1] || "",
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0]?.value || "",
                    googleId: profile.id,
                    password: null, // No password for Google users
                    category: 0,
                    isVerified: true,
                    credits: 1000
                });

                await user.save();
                console.log("so na you dey cause wahala");
                const populatedNewUser = await User.findById(user._id)
                    .populate({
                        path: 'partner',
                        select: 'firstName lastName email streak longestStreak' // Add streak and longestStreak here
                    })
                    .populate({
                        path: 'partnerInvites.from',
                        select: 'firstName lastName email'
                    });
                await welcomeEmailService.sendWelcomeDetails(user.email, user.firstName)
                return done(null, populatedNewUser);
            } catch (err) {
                console.error("❌ Error in Google OAuth Strategy:", err);
                return done(err, null);
            }
        }
    )
);

// Serialize user into session
passport.serializeUser((user, done) => {
    console.log("🔹 Serializing user:", user.id);
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        console.log("🔹 Deserializing user with ID:", id);
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error("❌ Error in deserializing user:", err);
        done(err, null);
    }
});

module.exports = passport;
