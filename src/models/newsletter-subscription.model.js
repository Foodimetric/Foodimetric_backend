const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    email: {type: String}
},
{
    timestamps: true
})

const Newsletter = mongoose.model("Newsletter", schema);
module.exports = Newsletter;