// controllers/promptController.js
const Prompt = require("../models/Prompt");

class PromptController {
    // Create or Update prompts for a category
    // async upsertPrompts(req, res) {
    //     try {
    //         const { category, prompts } = req.body;

    //         if (![0, 1, 2, 3].includes(category)) {
    //             return res.status(400).json({ success: false, message: "Invalid category" });
    //         }

    //         const updated = await Prompt.findOneAndUpdate(
    //             { category },
    //             { prompts },
    //             { new: true, upsert: true } // upsert creates if not exists
    //         );

    //         res.status(200).json({ success: true, data: updated });
    //     } catch (err) {
    //         res.status(500).json({ success: false, message: err.message });
    //     }
    // }

    async upsertPrompts(req, res) {
        try {
            const { category, prompts } = req.body;

            if (![0, 1, 2, 3].includes(category)) {
                return res.status(400).json({ success: false, message: "Invalid category" });
            }

            // Use $push to add new prompts to the array
            const updated = await Prompt.findOneAndUpdate(
                { category },
                { $push: { prompts: { $each: prompts } } },
                { new: true, upsert: true } // upsert creates if not exists
            );

            res.status(200).json({ success: true, data: updated });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    // Get prompts for a category
    async getPrompts(req, res) {
        try {
            const { category } = req.params;
            const prompts = await Prompt.findOne({ category: Number(category) });

            if (!prompts) {
                return res.status(404).json({ success: false, message: "No prompts found for this category" });
            }

            res.status(200).json({ success: true, data: prompts });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    // Get all prompts (for admin dashboard maybe)
    async getAllPrompts(req, res) {
        try {
            const prompts = await Prompt.find();
            res.status(200).json({ success: true, data: prompts });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async deletePrompt(req, res) {
        try {
            // Extract the category and the prompt to be deleted from the request body
            const { category, prompt } = req.body;

            if (![0, 1, 2, 3].includes(category)) {
                return res.status(400).json({ success: false, message: "Invalid category" });
            }

            // Use findOneAndUpdate with the $pull operator to remove the prompt
            const updated = await Prompt.findOneAndUpdate(
                { category },
                { $pull: { prompts: prompt } },
                { new: true } // Return the updated document
            );

            // Check if the document was found and updated
            if (!updated) {
                return res.status(404).json({ success: false, message: "Category not found." });
            }

            res.status(200).json({
                success: true,
                message: "Prompt deleted successfully.",
                data: updated
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new PromptController();
