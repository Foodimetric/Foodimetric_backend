const User = require("../models/user.models")
const axios = require('axios');
const Payment = require("../models/payment.model")
const paystack = require('paystack-api');
const paystackSecret = 'YOUR_SECRET_KEY';  // Replace with your secret key
const paystackInstance = paystack(paystackSecret);
const PromoCode = require("../models/promocode.model");


class PaymentController {
    async prepare(req, res) {
        const { amount, email, promoCode, plan } = req.body;
        const reference = `foodimetric-${Date.now()}`;

        try {
            let finalAmount = amount;
            let promo;

            if (promoCode) {
                promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });
                const now = new Date();

                if (!promo || promo.startDate > now || promo.expirationDate < now) {
                    return res.status(400).json({ error: "Invalid or expired promo code" });
                }

                if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) {
                    return res.status(400).json({ error: "Promo code usage limit reached" });
                }

                // Apply discount
                if (promo.discountType === 'percentage') {
                    finalAmount = amount - (amount * promo.discountValue / 100);
                } else if (promo.discountType === 'flat') {
                    finalAmount = amount - promo.discountValue;
                }

                if (finalAmount < 0) finalAmount = 0;
            }

            // Handle 100% discount
            if (finalAmount === 0) {
                // Update promo usage if promo applied
                if (promo) {
                    await PromoCode.updateOne(
                        { _id: promo._id },
                        { $inc: { timesUsed: 1 } }
                    );
                }

                // Mark user subscription as Premium immediately
                await User.findOneAndUpdate({ email }, { subscriptionStatus: plan });

                return res.json({
                    status: 'success',
                    reference,
                    email,
                    originalAmount: amount,
                    finalAmount,
                    message: "Promo code fully covered payment. Subscription activated."
                });
            }

            // Proceed with Paystack for non-zero amount
            const paymentData = {
                email,
                amount: Math.round(finalAmount * 100),
                reference,
            };

            const response = await paystackInstance.transaction.initialize(paymentData);
            if (response.status === 'success') {
                return res.json({
                    status: 'success',
                    reference: response.data.reference,
                    email,
                    originalAmount: amount,
                    finalAmount,
                });
            } else {
                return res.status(500).json({ error: 'Payment initialization failed' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async initialize(req, res) {
        try {
            const { email, amount, planType } = req.body;
            const userId = req.user._id; // Assuming you have auth middleware

            // Paystack expects amount in KOBO (multiply Naira by 100)
            const amountInKobo = amount * 100;

            const response = await axios.post(
                'https://api.paystack.co/transaction/initialize',
                {
                    email,
                    amount: amountInKobo,
                    metadata: {
                        user_id: userId,
                        plan: planType
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Create a pending payment record in your DB
            await Payment.create({
                userId: userId,
                email: email,
                amount: amount,
                reference: response.data.data.reference,
                status: 'pending'
            });

            // Return the authorization URL to the frontend
            return res.status(200).json(response.data.data);

        } catch (error) {
            console.error('Initialization Error:', error.response ? error.response.data : error.message);
            res.status(500).json({ message: "Could not initialize payment" });
        }
    }
    // 1. Better Signature Verification
    verifyPaystackSignature(req) {
        const signature = req.headers['x-paystack-signature'];
        const hash = crypto
            .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
            .update(JSON.stringify(req.body))
            .digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(hash),
            Buffer.from(signature)
        );

        console.log("Paystack Webhook Verified:", isValid);

        return hash === signature;
    }

    // 2. Updated Subscription Logic
    async handleSuccessfulPayment(data) {
        const { reference, customer, metadata, amount } = data;

        // Create the payment record first (the audit trail)
        const updatedPayment = await Payment.findOneAndUpdate(
            { reference: reference }, // Look for the record created during initialization
            {
                status: 'success',
                paidAt: new Date(),
                // Ensure amount matches (security check)
                amount: amount / 100
            },
            { new: true }
        );

        if (!updatedPayment) {
            // This handles cases where the webhook arrives but the 
            // initial record wasn't created (rare, but possible)
            await Payment.create({
                userId: metadata.user_id,
                email: customer.email,
                amount: amount / 100,
                reference: reference,
                status: 'success',
                paidAt: new Date()
            });
        }
        // Update the User
        // Find by ID (stored in metadata) or email
        return await User.findByIdAndUpdate(
            metadata.user_id,
            {
                subscriptionStatus: 'Premium',
                isPremium: true,
                $push: { paymentHistory: reference }
            },
            { new: true }
        );
    }

    async verify(req, res) {
        if (!this.verifyPaystackSignature(req)) {
            return res.status(400).send('Invalid signature');
        }

        const event = req.body;
        console.log("Paystack Webhook event status:", event);
        if (event.event === 'charge.success') {
            try {
                await this.handleSuccessfulPayment(event.data);
                console.log('Payment and User records updated');
            } catch (err) {
                console.error('Update Error:', err);
                return res.status(500).send('Error processing webhook');
            }
        }

        res.status(200).send('Webhook processed');
    }

    async verifyPromo(req, res) {
        const { promoCode } = req.body;

        if (!promoCode || typeof promoCode !== 'string') {
            return res.status(400).json({ valid: false, error: 'Promo code is required' });
        }

        try {
            const code = promoCode.trim().toUpperCase();
            const promo = await PromoCode.findOne({ code });

            if (!promo) {
                return res.json({ valid: false, error: 'Promo code not found' });
            }

            const now = new Date();

            if (promo.startDate > now || promo.expirationDate < now) {
                return res.json({ valid: false, error: 'Promo code is not active' });
            }

            if (promo.usageLimit !== null && promo.timesUsed >= promo.usageLimit) {
                return res.json({ valid: false, error: 'Promo code usage limit reached' });
            }

            return res.json({
                valid: true,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
            });

        } catch (error) {
            console.error('Error verifying promo code:', error);
            return res.status(500).json({ valid: false, error: 'Internal server error' });
        }
    }

}

module.exports = {
    PaymentController
};