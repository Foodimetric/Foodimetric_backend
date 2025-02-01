const fs = require("fs");
const WestAfricaFoodRepository = require("./src/repositories/WestAfricaFoodRepository");

const westAfricaFoodRepository = new WestAfricaFoodRepository();
const files = ["./data/west_africa_food.json"];

const addWestAfricaFoodDataToDB = () => {
    files.forEach(file => {
        console.log('file 1')
        fs.readFile(file, "utf-8", async (err, data) => {
            console.log('reading files');
            if (err) {
                console.error(`Error reading file ${file}:`, err.message);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                if (!Array.isArray(jsonData) || jsonData.length < 3) {
                    throw new Error("Invalid JSON structure: Expecting at least three arrays.");
                }
                let [firstArray, secondArray, thirdArray] = jsonData;
                
                let foodData = {};

                firstArray.forEach(item => {
                    let foodCode = item["NOM ABRÉGÉ"];
                    foodData[foodCode] = {
                        "FOOD CODE": foodCode,
                        "FOOD NAME IN ENGLISH": item["BiblioID"],
                        "VIT D (mcg)": item["RÉFÉRENCE"],
                        "VIT E (mg)": item.null?.[0] || null,
                        "THIAMINE (mg)": item.null?.[1] || null,
                        "RIBOFLAVIN (mg)": item.null?.[2] || null,
                        "NIACIN EQUIV (mg)": item.null?.[3] || null,
                        "NIACIN (mg)": item.null?.[4] || null,
                        "TRYPTOPHAN (mg)": item.null?.[5] || null,
                        "VIT B6 (mg)": item.null?.[6] || null,
                        "FOLATE (mcg)": item.null?.[7] || null,
                        "FOLATE EQUIV (mcg)": item.null?.[8] || null,
                        "VIT B12 (mcg)": item.null?.[9] || null,
                        "VIT C (mg)": item.null?.[10] || null
                    };
                });
        
                // Step 2: Merge second child array using "FOOD\nCODE" === "SYMBOLE"
                secondArray.forEach(item => {
                    let foodCode = item["SYMBOLE"];
                    if (foodData[foodCode]) {
                        foodData[foodCode] = {
                            ...foodData[foodCode],
                            "EDIBLE1": item.null?.[0] || null,
                            "ENERC (kJ(kcal))": item.null?.[1] || null,
                            "WATER (g)": item.null?.[2] || null,
                            "PROTCNT (g)": item.null?.[3] || null,
                            "FAT (g)": item.null?.[4] || null,
                            "CHOAVLDF (g)": item.null?.[5] || null,
                            "FIBTG (g)": item.null?.[6] || null,
                            "ASH (g)": item.null?.[7] || null
                        };
                    }
                });
        
                // Step 3: Merge third child array using "FOOD\nCODE"
                thirdArray.forEach(item => {
                    let foodCode = item["FOOD\nCODE"];
                    if (foodData[foodCode]) {
                        Object.keys(item).forEach(key => {
                            if (!["FOOD\nCODE", "FOOD NAME\nIN ENGLISH"].includes(key)) {
                                foodData[foodCode][key] = item[key];
                            }
                        });
                    }
                });
        
                // Convert foodData object to array
                const finalFoodArray = Object.values(foodData);
                // let fileData = Object.values(jsonData);
                await westAfricaFoodRepository.addFoodData(finalFoodArray);

                console.log(`Data successfully added from ${file}`);
            } catch (error) {
                console.error(`Error processing file ${file}:`, error.message);
            }
        });
    });
};

module.exports = { addWestAfricaFoodDataToDB };
