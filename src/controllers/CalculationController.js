const AnthroRepository = require('../repositories/AnthroRepository');
const { certainRespondMessage } = require('../utils/response');

const anthroRepository = new AnthroRepository();

class CalculationController {
  async saveCalculation(req, res) {
    try {
      const savedCalculation = await anthroRepository.saveCalculation(req.body);
      certainRespondMessage(res, savedCalculation, "Calculation saved successfully", 201);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getUserCalculations(req, res) {
    try {
      const { userId } = req.params;
      const calculations = await anthroRepository.getCalculationsByUser(userId);
      certainRespondMessage(res, calculations, "User calculations fetched successfully", 200);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAllCalculations(req, res) {
    try {
      const calculations = await anthroRepository.getAllCalculations();
      certainRespondMessage(res, calculations, "All calculations fetched successfully", 200);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteCalculation(req, res) {
    try {
      const { calculationId } = req.params;
      const deletedCalculation = await anthroRepository.deleteCalculationById(calculationId);
      if (!deletedCalculation) {
        return res.status(404).json({ error: 'Calculation not found' });
      }
      certainRespondMessage(res, deletedCalculation, "Calculation deleted successfully", 200);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteUserCalculations(req, res) {
    try {
      const { userId } = req.params;
      const result = await anthroRepository.deleteCalculationsByUser(userId);
      certainRespondMessage(res, { deletedCount: result.deletedCount }, "User calculations deleted successfully", 200);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = {
  CalculationController,
};
