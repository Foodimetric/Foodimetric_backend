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

}

module.exports = {
    UserController
}