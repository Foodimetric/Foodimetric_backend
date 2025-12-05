const Resource = require("../models/resource.models")


class ResourceController {
    // GET all resources (articles, recipes, events, videos, AI)
    async getAll(req, res) {
        try {
            // Read page and limit from query params (defaults: page=1, limit=10)
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Calculate the number of documents to skip
            const skip = (page - 1) * limit;

            // Fetch paginated resources
            const resources = await Resource.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Count total resources for pagination info
            const totalResources = await Resource.countDocuments();

            return res.status(200).json({
                message: "Resources fetched successfully",
                data: resources,
                pagination: {
                    total: totalResources,
                    page,
                    limit,
                    totalPages: Math.ceil(totalResources / limit)
                }
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error });
        }
    }

    // GET resources by category
    async getByCategory(req, res) {
        try {
            const { category } = req.params;

            const resources = await Resource.find({ category: category.toUpperCase() });

            return res.status(200).json({
                message: "Category resources fetched successfully",
                data: resources
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error });
        }
    }

    // CREATE (Admin)
    async create(req, res) {
        try {
            const newResource = await Resource.create(req.body);

            return res.status(201).json({
                message: "Resource created successfully",
                data: newResource
            });
        } catch (error) {
            return res.status(400).json({ message: "Invalid data", error });
        }
    }

    // EDIT (Admin)
    async update(req, res) {
        try {
            const { id } = req.params;

            const updated = await Resource.findByIdAndUpdate(id, req.body, {
                new: true,
            });

            if (!updated) {
                return res.status(404).json({ message: "Resource not found" });
            }

            return res.status(200).json({
                message: "Resource updated successfully",
                data: updated
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error });
        }
    }

    // DELETE (Admin)
    async delete(req, res) {
        try {
            const { id } = req.params;

            const removed = await Resource.findByIdAndDelete(id);

            if (!removed) {
                return res.status(404).json({ message: "Resource not found" });
            }

            return res.status(200).json({
                message: "Resource deleted successfully"
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error });
        }
    }

    // LIKE ARTICLE (increments likes)
    async like(req, res) {
        try {
            const { id } = req.params;

            const updated = await Resource.findByIdAndUpdate(
                id,
                { $inc: { likes: 1 } },
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Resource not found" });
            }

            return res.status(200).json({
                message: "Article liked successfully",
                likes: updated.likes
            });
        } catch (error) {
            return res.status(500).json({ message: "Server error", error });
        }
    }
}

export default new ResourceController();