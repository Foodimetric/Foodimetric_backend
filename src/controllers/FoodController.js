const User = require("../models/user.models");
const FoodRepository = require("../repositories/FoodRepository");
const { certainRespondMessage } = require("../utils/response");


const foodRepository = new FoodRepository()
class FoodController{

    // async getUserById(req, res){
    //     const {id} = req.params;
    //     getUser(id, res)
    // }

    async getFoodByDetails(req, res){
        try{
            const body = req.body;
            const result = await foodRepository.getDetails(body.foodName)
            certainRespondMessage(res, result.payload,  "Successful", 200)
        }
        catch(err){
            res.json(err).status(err.status)
        }
    }

    async getAll(req, res){
        try{
            const result = await foodRepository.getAll()
            certainRespondMessage(res, result.payload,  "Successful", 200)
        }
        catch(err){
            res.json(err).status(err.status)
        }
    }

    async filterByLocation(req, res){
        try{
            let {location} = req.params
            const result = await foodRepository.getFoodByLocation(location)
            certainRespondMessage(res, result.payload,  "Successful", 200)
        }
        catch(err){
            res.json(err).status(err.status)
        }
    }

}

module.exports = {
    FoodController
}