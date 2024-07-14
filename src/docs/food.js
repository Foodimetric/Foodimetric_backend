/**
 * @swagger
 * components:
 *   schemas:
 *     Food:
 *       type: object
 *       properties:
 *         foodName:
 *           type: string
 *           description: The name of the food
 *         details:
 *           type: object
 *           description: Details of the food
 *         location:
 *           type: string
 *           description: The location of the food
 *       example:
 *         foodName: "Pizza"
 *         details: { "ingredients": ["cheese", "tomato"], "size": "Large" }
 *         location: "New York"
 *
 * tags:
 *   - name: Food
 *     description: API endpoints for managing food
 */

/**
 * @swagger
 * /get-details:
 *   post:
 *     summary: Get food details by food name
 *     tags: [Food]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               foodName:
 *                 type: string
 *                 description: The name of the food
 *             example:
 *               foodName: "Pizza"
 *     responses:
 *       200:
 *         description: Food details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Food'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all food items
 *     tags: [Food]
 *     responses:
 *       200:
 *         description: All food items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Food'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /by-location/{location}:
 *   get:
 *     summary: Get food by location
 *     tags: [Food]
 *     parameters:
 *       - in: path
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: The location of the food
 *     responses:
 *       200:
 *         description: Food items retrieved by location successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Food'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */