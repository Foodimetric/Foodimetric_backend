const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { EmailService } = require("../services/EmailServices");
const { WelcomeEmailService } = require("../services/WelcomeEmailServices");

require("dotenv").config();

const jwt_secret = process.env.JWT_SECRET;

const emailService = new EmailService();
const welcomeEmailService = new WelcomeEmailService();

class UserRepository {
  constructor() {
    this.Model = User;
  }

  async save(user) {
    const newUser = new this.Model(user);
    let result = await newUser.save();
    return result;
  }

  async getUserById(userId) {
    let result = await this.Model.findById(userId);
    return {
      payload: result,
    };
  }

  async signIn(email, password) {
    try {
      let user = await this.Model.findOne({ email }).populate('partner partnerInvites.from', 'firstName lastName email');
      if (!user) {
        return {
          message: "There is no user with this email",
          responseStatus: 403,
        };
      }

      if (!user.isVerified) {
        return {
          message: "You're yet to verify your account, kindly check your email for verification link.",
          responseStatus: 403,
        };
      }

      let doMatch = await bcrypt.compare(password, user.password);
      if (doMatch) {
        const token = jwt.sign({ _id: user._id }, jwt_secret, { expiresIn: "7d" });
        return {
          payload: { token, user },
        };
      } else {
        return {
          message: "Incorrect Password",
          responseStatus: 403,
        };
      }
    } catch (err) {
      return err;
    }
  }

  async signUp(userDetails) {
    let password = userDetails.password;
    try {
      let resp = await this.Model.findOne({ email: userDetails.email });
      if (!resp) {
        let hashedPassword = await bcrypt.hash(password, 8);
        userDetails.password = hashedPassword;
        userDetails.category = userDetails.category || 0;
        const newUser = new this.Model(userDetails);
        let user = await newUser.save();
        const token = jwt.sign({ _id: user._id }, jwt_secret);
        await emailService.sendSignUpDetails(user.email, token);
        return {
          payload: { user },
        };
      } else {
        return {
          message: "This Email or Username has been used",
          responseStatus: 403,
        };
      }
    } catch (err) {
      return {
        message: err,
        responseStatus: 403,
      };
    }
  }

  // async editProfile(update, user) {
  //   let result = await this.Model.findByIdAndUpdate(user._id, update, {
  //     new: true,
  //   });
  //   return {
  //     payload: result,
  //   };
  // }

  async editProfile(update, user) {
    // Define fields allowed in the update
    const generalFields = [
      'location',
      'category', 'profilePicture',
    ];

    const healthFields = [
      'age', 'sex', 'weight', 'height', 'bmi',
      'whr', 'bmr', 'eatingHabit', 'preferences',
      'conditions', 'goals'
    ];

    const updateDoc = {};

    // Handle general fields (e.g. firstName, location, etc.)
    for (let key of generalFields) {
      if (key in update) {
        updateDoc[key] = update[key];
      }
    }

    // Handle healthProfile fields (e.g. age, bmi, etc.)
    for (let key of healthFields) {
      if (key in update) {
        updateDoc[`healthProfile.${key}`] = update[key];
      }
    }

    // Perform the update
    const result = await this.Model.findByIdAndUpdate(
      user._id,
      { $set: updateDoc },
      { new: true }
    );

    return {
      payload: result,
    };
  }

  async verifyUser(token) {
    let { _id } = jwt.verify(token, jwt_secret);
    if (!_id) {
      return null;
    }

    let user = await this.Model.findById(_id);
    user.isVerified = true;
    user.credits = 1000;
    user = await this.editProfile(user, user);
    console.log(user);
    console.log("no be me oo dey cause wahala", user.email);
    await welcomeEmailService.sendWelcomeDetails(user.email, user.firstName)

    return {
      message: "Successful",
      payload: user,
    };
  }

  async resendVerificationEmail(email) {
    let user = await this.Model.findOne({ email });
    if (!user) return null;  // No user found with that email

    if (user.isVerified) {
      // User already verified, no need to resend
      return { message: "User already verified" };
    }

    // Generate a new token for verification
    const token = jwt.sign({ _id: user._id }, jwt_secret, { expiresIn: '1d' }); // optional expiry for security

    // Send verification email again
    await emailService.sendSignUpDetails(user.email, token);

    return { message: "Verification email resent" };
  }

  async getAllUserEmails() {
    try {
      const users = await this.Model.find({}, "email firstName");  // Fetch only the email field
      console.log("emails", users);
      return {
        payload: users,
        responseStatus: 200,
      };
    } catch (err) {
      return {
        message: err.message,
        responseStatus: 500,
      };
    }
  }
  async deleteUserById(userId) {
    try {
      const result = await this.Model.findByIdAndDelete(userId);
      if (!result) {
        return {
          message: "User not found",
          responseStatus: 404,
        };
      }

      return {
        message: "User account deleted successfully",
        responseStatus: 200,
      };
    } catch (err) {
      return {
        message: err.message,
        responseStatus: 500,
      };
    }
  }

  async getUserByEmail(email) {
    return await this.Model.findOne({ email });
  }

  // Update password
  async updatePassword(email, newPassword) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();
    return user;
  }

}

module.exports = UserRepository;
