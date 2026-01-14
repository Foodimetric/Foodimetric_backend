const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentModel = new Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    }, // Store in kobo/cents (e.g., 5000 for ₦50.00)
    reference: { 
        type: String, 
        required: true, 
        unique: true 
    }, // The unique Paystack ref
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    channel: { 
        type: String 
    }, // card, bank, qr, etc.
    currency: { 
        type: String, 
        default: 'NGN' 
    },
    paidAt: { 
        type: Date 
    },
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentModel);
module.exports = Payment;