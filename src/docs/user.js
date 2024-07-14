/**
 * @swagger
 * components:
 *   schemas:
 *     UserDto:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@example.com"
 *         password: "Password123"
 * 
 *     CreateUserDto:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         size:
 *           type: string
 *           description: The size of the user
 *         houseHoldSize:
 *           type: number
 *           description: The household size of the user
 *         primaryCookingAppliance:
 *           type: string
 *           description: The primary cooking appliance of the user
 *         generatedOtp:
 *           type: string
 *           description: The generated OTP for user verification
 *         generatedOtpExpiration:
 *           type: string
 *           format: date-time
 *           description: The expiration date and time of the generated OTP
 *       example:
 *         firstName: "Jane"
 *         lastName: "Doe"
 *         email: "jane.doe@example.com"
 *         password: "Password123"
 *         size: "Medium"
 *         houseHoldSize: 3
 *         primaryCookingAppliance: "Gas stove"
 *         generatedOtp: "123456"
 *         generatedOtpExpiration: "2023-07-01T00:00:00.000Z"
 *
 *     UpdateUserDto:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         profilePicture:
 *           type: string
 *           description: The URL of the user's profile picture
 *       example:
 *         firstName: "John"
 *         lastName: "Doe"
 *         email: "john.doe@example.com"
 *         profilePicture: "https://example.com/profile.jpg"
 * 
 *     UserLoginDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *       example:
 *         email: "john.doe@example.com"
 *         password: "Password123"
 *
 * tags:
 *   - name: Users
 *     description: API endpoints for managing users
 */

/**
 * @swagger
 * /sign-in:
 *   post:
 *     summary: Sign in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginDto'
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /sign-up:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: User signed up successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateUserDto'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /logged-user:
 *   get:
 *     summary: Get logged in user information
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /update-profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: Successfully updated profile
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /verify-user/{token}:
 *   get:
 *     summary: Verify user with token
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification token
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Verification message
 *       400:
 *         description: Bad request
 *       500:
 *         description: Some server error
 */
