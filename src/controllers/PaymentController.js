const User = require("../models/user.models")
const paystack = require('paystack-api');
const paystackSecret = 'YOUR_SECRET_KEY';  // Replace with your secret key
const paystackInstance = paystack(paystackSecret);


class PaymentController {
    async prepare(req, res) {
        const { amount, email } = req.body;
        const reference = `foodimetric-${Date.now()}`;  // Unique reference

        try {
            const paymentData = {
                email,
                amount: amount * 100,  // Convert amount to kobo
                reference,
            };

            const response = await paystackInstance.transaction.initialize(paymentData);
            if (response.status === 'success') {
                return res.json({
                    status: 'success',
                    reference: response.data.reference,
                    email,
                    amount: amount,
                });
            } else {
                return res.status(500).json({ error: 'Payment initialization failed' });
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    verifyPaystackSignature(event, signature) {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha512', paystackSecret);
        hmac.update(JSON.stringify(event));
        const computedSignature = hmac.digest('hex');
        return signature === computedSignature;
    };

    updateUserSubscription(reference) {
        User.findOneAndUpdate({ reference }, { subscriptionStatus: 'Premium' }, (err, user) => {
            if (err) {
                console.error('Error updating user subscription:', err);
            } else {
                console.log('User subscription updated:', user);
            }
        });
    };


    async verify(req, res) {
        const signature = req.headers['x-paystack-signature'];
        const event = req.body;

        // Verify webhook signature
        const isVerified = verifyPaystackSignature(event, signature);
        if (!isVerified) {
            return res.status(400).send('Invalid signature');
        }

        // Check if payment was successful
        if (event.event === 'charge.success') {
            const { reference, status } = event.data;

            if (status === 'success') {
                // Update your database with the payment status
                // e.g., update user’s subscription to Premium or Professional plan
                updateUserSubscription(reference);
            }
        }

        res.status(200).send('Webhook received');
    }
}

module.exports = {
    PaymentController
};