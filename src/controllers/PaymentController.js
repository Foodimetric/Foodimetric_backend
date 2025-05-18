const User = require("../models/user.models")
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
                await User.findOneAndUpdate({ email }, { subscriptionStatus: plan});

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

        const isVerified = this.verifyPaystackSignature(event, signature);
        if (!isVerified) {
            return res.status(400).send('Invalid signature');
        }

        if (event.event === 'charge.success') {
            const { reference, status } = event.data;
            if (status === 'success') {
                this.updateUserSubscription(reference);
            }
        }

        res.status(200).send('Webhook received');
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