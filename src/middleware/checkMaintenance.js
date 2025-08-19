// middleware/checkMaintenance.js
const SystemSetting = require("../models/systemSetting.model");

const checkMaintenance = async (req, res, next) => {
    try {
        const setting = await SystemSetting.findOne({ key: "maintenanceMode" });
        if (setting && setting.value === true) {
            return res.status(503).json({
                success: false,
                message: "The system is under maintenance. Please try again later."
            });
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = checkMaintenance;