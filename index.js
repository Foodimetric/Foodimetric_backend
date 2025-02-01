const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
require("dotenv").config()
const userRoute = require("./src/routes/user-routes");
const foodRoute = require("./src/routes/food-routes");
const calculationsRoutes = require("./src/routes/calculation");
const diaryRoutes = require("./src/routes/diary");
const { addDataToDB } = require('./read_json');
const { addWestAfricaFoodDataToDB } = require('./west_json');
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const Food = require('./src/models/food.models');
const User = require('./src/models/user.models');
const passport = require("./src/config/passport");

const app = express();

//activate cors
app.use(
  cors({
    origin: "*"
  })
)
// app.use(express.urlencoded({ extended: true })); 
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Foodimetric API",
      version: "0.1.0",
      description:
        "This is the docs for all APIs for Foodimetric",
    },
    servers: [
      {
        url: "https://foodimetric-backend.onrender.com",
      },
    ],
  },
  apis: ["./src/docs/*.js"],
};

const specs = swaggerJSDoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCssUrl:
      "https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-newspaper.css",
  })
);

//set port and db uri
const port = process.env.PORT || 5010
const uri = process.env.DB_URI


//local const uri = 
// connect mongodb
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection
connection.once('open', async () => {
  console.log('Database running Successfully')
  await addWestAfricaFoodDataToDB();
  console.log('west africa added Successfully')
})

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'src/routes/uploads')));

app.use("/users", userRoute)
app.use("/foods", foodRoute)
app.use('/calculations', calculationsRoutes);
app.use('/food_diary', diaryRoutes);
// app.use(passport.initialize());
// app.use(passport.session());
app.get("/add-data", (req, res) => {
  addDataToDB()
  res.json("Done")
})

// app.get("/add-west", (req, res)=>{
//   addWestAfricaFoodDataToDB()
//   res.json("Done")    
// })

//run server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})