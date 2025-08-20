// // utils/redis.js
// const { createClient } = require("redis");

// const redisClient = createClient({
//   url: process.env.REDIS_URL,
// });

// redisClient.connect().catch(console.error);

// module.exports = redisClient;


// utils/redis.js
const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
})();

module.exports = redisClient;
