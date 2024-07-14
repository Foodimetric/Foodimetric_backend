const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { EmailService } = require("../services/EmailServices");
require("dotenv").config();

const jwt_secret = process.env.JWT_SECRET;

const emailService = new EmailService();

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
      let user = await this.Model.findOne({ email });
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
        const token = jwt.sign({ _id: user._id }, jwt_secret);
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

  async editProfile(update, user) {
    let result = await this.Model.findByIdAndUpdate(user._id, update, {
      new: true,
    });
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
    user = await this.editProfile(user, user);
    console.log(user);

    return {
      message: "Successful",
      payload: user,
    };
  }
}

module.exports = UserRepository;
