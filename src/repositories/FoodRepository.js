const Food = require("../models/food.models");
require("dotenv").config()

const jwt_secret = process.env.JWT_SECRET

class FoodRepository {
    constructor() {
        this.Model = Food;
    }

    async save(user) {
        const newFood = new this.Model(user);
        let result = await newFood.save()
        console.log("Added")
        return result
    }

    async addFood(fileData){
        let foodList = []
        for(let i=0; i <= fileData.length-1; i++){
            let data = fileData[i]
            if(data['FOOD NAME IN ENGLISH'] || data["FOOD NAME\nIN ENGLISH"] || data["EnglishName"]){    
                const food = {}
                food["foodName"] = data['FOOD NAME IN ENGLISH'] || data["FOOD NAME\nIN ENGLISH"] || data["EnglishName"];
                food["details"] = data;
                foodList.push(food)
            }
            
        }
        let resp = await this.Model.collection.bulkWrite(foodList.map(data => ({
            insertOne: {
              document: data
            }
          })))
        
    }


    async getFoodById(userId) {
        let result = await this.Model.findById(userId)
        return {
            payload: result
        }
    }

    async getAll(){
        let result = await this.Model.find()
        return{
            payload: result
        }
    }

    async getDetails(foodName){
        // const orConditions = Object.entries(searchCriteria).map(([key, value]) => ({ [`details.${key}`]: value }));
        let result = await this.Model.find({ foodName: { $regex: '\\b' + foodName + '\\b', $options: 'i' }});
        return{
            payload: result
        }
    }

    async clearDB(){
        
    }

    async getFoodByLocation(location){
        let result = await this.Model.find({
            location
        })
        return {
            payload: result
        }
    }
}

module.exports = FoodRepository