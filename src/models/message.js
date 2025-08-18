const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  // user_id: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
