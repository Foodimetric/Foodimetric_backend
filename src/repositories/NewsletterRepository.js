const Newsletter = require("../models/newsletter-subscription.model");

class NewsletterRepository {
    constructor() {
        this.Model = Newsletter;
    }

    async subscribe(email) {
        try {
            const existingSubscription = await this.Model.findOne({ email });
            if (existingSubscription) {
                return {
                    message: "This email is already subscribed to the newsletter.",
                    responseStatus: 409,
                };
            }

            const subscription = new this.Model({ email });
            await subscription.save();

            return {
                message: "Subscription successful!",
                responseStatus: 201,
            };
        } catch (err) {
            return {
                message: err.message,
                responseStatus: 500,
            };
        }
    }
}

module.exports = NewsletterRepository;
