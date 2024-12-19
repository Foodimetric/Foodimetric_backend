const NewsletterRepository = require("../repositories/NewsletterRepository");
const { certainRespondMessage } = require("../utils/response");

const newsletterRepository = new NewsletterRepository();

class NewsletterController {
    async subscribe(req, res) {
        const { email } = req.body;

        if (!email) {
            return certainRespondMessage(res, null, "Email is required", 400);
        }

        const result = await newsletterRepository.subscribe(email);
        certainRespondMessage(res, null, result.message, result.responseStatus);
    }
}

module.exports = {
    NewsletterController
};
