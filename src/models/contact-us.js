const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    email: String,
    name: String,
    message: String
},
{
    timestamps: true
})

const Contacted = mongoose.model("Contacted", schema);
module.exports = Contacted;