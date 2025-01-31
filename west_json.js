const fs = require("fs");
const WestAfricaFoodRepository = require("./src/repositories/WestAfricaFoodRepository");

const westAfricaFoodRepository = new WestAfricaFoodRepository();
const files = ["./data/west_africa_food.json"];

const addWestAfricaFoodDataToDB = () => {
    console.log("Script is starting...");
    files.forEach(file => {
        console.log(`Reading file: ${file}`);
        fs.readFile(file, "utf-8", async (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:, err.message`);
                return;
            }

            try {
                let jsonData = JSON.parse(data);

                // Ensure jsonData is an array of arrays
                if (!Array.isArray(jsonData)) {
                    console.error(`Invalid JSON format in ${file}`);
                    return;
                }

                // Flatten the array and remove headers (empty rows or those without food names)
                let fileData = jsonData.flat().filter(row => 
                    row["NOM ABRÉGÉ"] && row["BiblioID"] && row["NOM ABRÉGÉ"] !== "FOOD CODE"
                );

                // Upload the cleaned data without modifications
                await westAfricaFoodRepository.addFoodData(fileData);
                console.log(`Data successfully added from ${file}`);
            } catch (error) {
                console.error(`Error processing file ${file}:, error.message`);
            }
        });
    });
};

module.exports = { addWestAfricaFoodDataToDB };