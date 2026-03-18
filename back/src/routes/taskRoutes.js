const express = require('express');
const TaskController = require('../controllers/taskController');
const {
  validateCreateTask,
  validateGetTasksByUserId,
  validateGetTaskById,
  validateUpdateTask,
  validateDeleteTask
} = require('../validators/taskValidator');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gestion des tâches (Protégé)
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crée une nouvelle tâche
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - userId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Todo, In Progress, Done]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tâche créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé (Token manquant ou invalide)
 */
router.post('/', validateCreateTask, TaskController.createTask);

/**
 * @swagger
 * /api/tasks/user/{userId}:
 *   get:
 *     summary: Récupère toutes les tâches d'un utilisateur
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste des tâches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       400:
 *         description: ID utilisateur invalide
 *       401:
 *         description: Non autorisé
 */
router.get('/user/:userId', validateGetTasksByUserId, TaskController.getTasksByUserId);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Récupère une tâche par son ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID de la tâche
 *     responses:
 *       200:
 *         description: Tâche trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tâche non trouvée
 *       401:
 *         description: Non autorisé
 */
router.get('/:id', validateGetTaskById, TaskController.getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Met à jour une tâche
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID de la tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Todo, In Progress, Done]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non autorisé
 */
router.put('/:id', validateUpdateTask, TaskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Supprime une tâche
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: L'ID de la tâche
 *     responses:
 *       204:
 *         description: Tâche supprimée avec succès
 *       401:
 *         description: Non autorisé
 */
router.delete('/:id', validateDeleteTask, TaskController.deleteTask);

module.exports = router;