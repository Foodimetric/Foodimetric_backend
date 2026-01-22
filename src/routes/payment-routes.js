const { PaymentController } = require("../controllers/PaymentController");
const requireLogin = require("../utils/requireLogin")


const route = require("express").Router();

const paymentController = new PaymentController()
route.post('/paystack/prepare-payment', requireLogin, paymentController.prepare)
route.post('/paystack/initialize', paymentController.initialize)

route.post('/paystack/webhook', paymentController.verify);
route.post('/verify-promo', paymentController.verifyPromo);


module.exports = route;