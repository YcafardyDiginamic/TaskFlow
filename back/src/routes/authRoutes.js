const express = require('express');
const AuthController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API d'authentification
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecte un utilisateur et retourne un jeton JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@taskflow.com
 *               password:
 *                 type: string
 *                 example: SuperSecretPassword123!
 *     responses:
 *       200:
 *         description: Authentification réussie (retourne le token et l'utilisateur)
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renouvelle l'Access Token en utilisant le Refresh Token stocké en cookie
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nouveau token d'accès généré
 *       401:
 *         description: Refresh token manquant, expiré ou invalide
 */
router.post('/refresh', AuthController.refresh);

module.exports = router;