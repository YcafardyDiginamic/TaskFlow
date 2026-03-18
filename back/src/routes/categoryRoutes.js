const express = require('express');
const CategoryController = require('../controllers/categoryController');
const {
  validateCreateCategory,
  validateGetCategoriesByUserId,
  validateUpdateCategory,
  validateDeleteCategory
} = require('../validators/categoryValidator');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: Projet de Fin d'Étude
 *         color:
 *           type: string
 *           example: "#FF5733"
 *         userId:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestion des catégories (Protégé)
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crée une nouvelle catégorie
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 */
router.post('/', validateCreateCategory, CategoryController.createCategory);

/**
 * @swagger
 * /api/categories/user/{userId}:
 *   get:
 *     summary: Récupère toutes les catégories d'un utilisateur
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des catégories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       400:
 *         description: ID utilisateur invalide
 *       401:
 *         description: Non autorisé
 */
router.get('/user/:userId', validateGetCategoriesByUserId, CategoryController.getCategoriesByUserId);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Met à jour une catégorie
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la catégorie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catégorie mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 */
router.put('/:id', validateUpdateCategory, CategoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Supprime une catégorie
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la catégorie
 *     responses:
 *       204:
 *         description: Catégorie supprimée avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Non autorisé
 */
router.delete('/:id', validateDeleteCategory, CategoryController.deleteCategory);

module.exports = router;