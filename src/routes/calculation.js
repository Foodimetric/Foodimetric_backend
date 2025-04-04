const express = require('express');
const router = express.Router();
const { CalculationController } = require('../controllers/CalculationController');

const calculationsController = new CalculationController();

router.post('/', calculationsController.saveCalculation.bind(calculationsController));
router.get('/user/:userId', calculationsController.getUserCalculations.bind(calculationsController));
router.get('/all', calculationsController.getAllCalculations.bind(calculationsController));
router.delete('/:calculationId', calculationsController.deleteCalculation.bind(calculationsController));
router.delete('/user/:userId', calculationsController.deleteUserCalculations.bind(calculationsController));

module.exports = router;
