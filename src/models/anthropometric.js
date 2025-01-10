const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for anthropometric calculations
const AnthropometricCalculationSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        required: true,
        ref: 'User'
    },
    calculator_name: {
        type: String,
        required: true, // e.g., "BMI", "Ideal Body Weight", etc.
        enum: [
            'BMI',
            'IBW',
            'WHR',
            'BMR',
            'EER',
            'EE',
        ]
    },
    parameters: {
        type: Map,
        of: Schema.Types.Mixed, // Stores the input parameters (e.g., weight, height)
        required: true
    },
    result: {
        type: Schema.Types.Mixed, // Stores the result of the calculation (e.g., BMI value)
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    calculation_details: {
        type: String, // Optional field for additional details about the calculation
        default: ''
    }
});

// Create the model based on the schema
const AnthropometricCalculation = mongoose.model('AnthropometricCalculation', AnthropometricCalculationSchema);

module.exports = AnthropometricCalculation;