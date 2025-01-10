const AnthropometricCalculation = require('../models/anthropometric');

class AnthroRepository {
    // Save a new calculation
    async saveCalculation(data) {
        const calculation = new AnthropometricCalculation(data);
        return calculation.save();
    }

    // Get all calculations for a specific user
    async getCalculationsByUser(userId) {
        return AnthropometricCalculation.find({ user_id: userId });
    }

    // Get all calculations in the database
    async getAllCalculations() {
        return AnthropometricCalculation.find();
    }

    // Delete a calculation by ID
    async deleteCalculationById(calculationId) {
        return AnthropometricCalculation.findByIdAndDelete(calculationId);
    }

    // Delete all calculations for a specific user
    async deleteCalculationsByUser(userId) {
        return AnthropometricCalculation.deleteMany({ user_id: userId });
    }
}

module.exports = new AnthroRepository();
