const { PaymentController } = require("../controllers/PaymentController");

const route = require("express").Router();

const paymentController =new PaymentController()
route.post('/paystack/prepare-payment', paymentController.prepare)

route.post('/paystack/webhook', paymentController.verify);
  

module.exports = route;