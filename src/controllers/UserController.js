const User = require("../models/user.models")
const UserRepository = require("../repositories/UserRepository");
const { certainRespondMessage } = require("../utils/response");


const getUser = async (id, res)=>{
    try{
        let result = await userRepository.getUserById(id)
        if(result.payload){
            certainRespondMessage(res, result.payload, result.message, result.responseStatus)
        }
        else{
            result = {
                message: "User not found",
                responseStatus: 404
            }
            certainRespondMessage(res, result.payload, result.message, result.responseStatus)
        }
    }
    catch(err){
        let result = {
            message: "User not found",
            responseStatus: 404
        }
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }
}

const userRepository = new UserRepository()
class UserController{
  
    async signIn(req, res){
        const {email, password} = req.body
        console.log({email, password})
        let result = await userRepository.signIn(email, password)
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }
    async signUp(req, res){
        const content = req.body
        console.log(content)
        content.category = content.category || 0;
        let result = await userRepository.signUp(content)
        console.log(result)
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }

    async getUserById(req, res){
        const {id} = req.params;
        getUser(id, res)
    }

    async getLoggedUser(req, res){
        const id = req.user._id
        getUser(id, res)
    }

    async updateProfile(req, res){
        const update = req.body;
        const user = req.user
        let result = await userRepository.editProfile(update, user)
        certainRespondMessage(res, result.payload, result.message, result.responseStatus)
    }

    async verifyUser(req, res){
        try{
            const {token} = req.params;
            if(!token){
                certainRespondMessage(res, null, "No Token Parsed", 400)
            }
            let result = await userRepository.verifyUser(token);
            if(!result){
                certainRespondMessage(res, null, "Invalid Token", 400)
            }
            certainRespondMessage(res, result.payload, result.message, 200)
        }
        catch(err){
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
    
}

module.exports = {
    UserController
}