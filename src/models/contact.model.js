const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    service: { type: String, required: true },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;