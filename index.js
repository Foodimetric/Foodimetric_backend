const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const { Server } = require("socket.io");
const Redis = require("ioredis");
const { createServer } = require("http");
const axios = require("axios");
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
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, methods: ["GET", "POST"] }
});


const redis = new Redis();

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
  // await addWestAfricaFoodDataToDB();
  // console.log('west africa added Successfully')
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

const NUTRIBOT_API_URL = "https://foodimetric-bot.onrender.com/api/chat"; // Python API

// REST API Endpoint for Chat
app.post("/chat", async (req, res) => {
  const { text, user_id } = req.body;
  const cacheKey = `chat:${user_id}:${text}`;

  // Check if response exists in cache
  const cachedResponse = await redis.get(cacheKey);
  if (cachedResponse) {
    return res.json(JSON.parse(cachedResponse));
  }

  try {
    const response = await axios.post(NUTRIBOT_API_URL, { text, user_id });
    redis.setex(cacheKey, 3600, JSON.stringify(response.data)); // Cache for 1 hour
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error communicating with NutriBot API" });
  }
});

// WebSocket for real-time chat
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chat_message", async (data) => {
    const { text, user_id } = data;
    const cacheKey = `chat:${user_id}:${text}`;

    const cachedResponse = await redis.get(cacheKey);
    if (cachedResponse) {
      return socket.emit("chat_response", JSON.parse(cachedResponse));
    }

    try {
      const response = await axios.post(NUTRIBOT_API_URL, { text, user_id });
      redis.setex(cacheKey, 3600, JSON.stringify(response.data));
      socket.emit("chat_response", response.data);
    } catch (error) {
      socket.emit("error", { error: "Failed to connect to NutriBot API" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


//run server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})