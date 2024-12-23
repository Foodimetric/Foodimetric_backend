const fs = require("fs");
const WestAfricaFoodRepository = require("./src/repositories/WestAfricaFoodRepository");

const repository = new WestAfricaFoodRepository();
const filePath = "./data/west_africa_output.json";

fs.readFile(filePath, "utf-8", async (err, data) => {
    if (err) {
        console.error("Error reading file:", err.message);
        return;
    }

    const jsonData = JSON.parse(data);
    await repository.addFoodData(jsonData);
});
