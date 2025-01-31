const fs = require("fs");
const WestAfricaFoodRepository = require("./src/repositories/WestAfricaFoodRepository");

const westAfricaFoodRepository = new WestAfricaFoodRepository();
const files = ["./data/west_africa_food.json"];

const addWestAfricaFoodDataToDB = () => {
    files.forEach(file => {
        fs.readFile(file, "utf-8", async (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err.message);
                return;
            }

            try {
                const jsonData = JSON.parse(data);
                let fileData = Object.values(jsonData);
                await westAfricaFoodRepository.addFoodData(fileData);
                console.log(`Data successfully added from ${file}`);
            } catch (error) {
                console.error(`Error processing file ${file}:`, error.message);
            }
        });
    });
};

module.exports = { addWestAfricaFoodDataToDB };
