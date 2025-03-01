const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.models"); // Your User model

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.URL + "/users/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("🔹 Google OAuth callback triggered");
                console.log("🔹 Received Profile:", profile);
                // Check if the user already exists
                let user = await User.findOne({ googleId: profile.id });
                console.log("🔹 User found in DB:", user);

                if (!user) {
                    console.log("⚡ New user, creating entry in DB...");
                    // Create a new user
                    user = new User({
                        firstName: profile.displayName.split(" ")[0] || "", // Extract first name
                        lastName: profile.displayName.split(" ")[1] || "",
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        password: null, // No password for Google users
                        category: 0, // Default category
                        isVerified: true, // Mark Google users as verified
                    });

                    await user.save();
                    console.log("✅ New user saved:", user);
                }
                console.log("✅ Existing user logging in:", user);
                return done(null, user);
            } catch (err) {
                console.error("❌ Error in Google OAuth Strategy:", err)
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
