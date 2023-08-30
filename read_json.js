const fs = require("fs")
const FoodRepository = require("./src/repositories/FoodRepository")

const foodRepository =  new FoodRepository()
const files = ["./data/output_1.json", "./data/output_2.json", "./data/output_4.json", "./data/output_5.json"]

const addDataToDB = ()=>{
    const totalData = []
for(let i=0; i <= files.length - 1; i++){
    fs.readFile(files[i], "utf-8", async (err, data)=>{
    if(err){
        console.log(err.message)
        return;
    }

    const jsonData = JSON.parse(data)
    let fileData = Object.values(jsonData)
    for(let j = 0; j <= fileData.length - 1; j++){
        totalData.push(fileData[j])
    }
    console.log(totalData)
    await foodRepository.addFood(fileData)
})
}
}

module.exports = {addDataToDB}

