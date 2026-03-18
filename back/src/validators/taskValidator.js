const { body, param, validationResult } = require('express-validator');

const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Erreur de validation syntaxique',
      errors: errors.array()
    });
  }
  next();
};

// Règles de validation pour la création d'une tâche
const validateCreateTask = [
  body('title')
    .exists({ checkFalsy: true }).withMessage('Le titre de la tâche est obligatoire.')
    .isString().withMessage('Le titre doit être une chaîne de caractères.'),
  
  body('userId')
    .exists({ checkFalsy: true }).withMessage('L\'ID de l\'utilisateur est obligatoire.')
    .isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),

  body('description').optional().isString().withMessage('La description doit être une chaîne de caractères.'),
  body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Le statut doit être "todo", "in_progress" ou "done".'),
  body('dueDate').optional().isISO8601().withMessage('La date d\'échéance doit être une date valide (format ISO 8601).'),
  body('categoryId').optional().isMongoId().withMessage('L\'ID de la catégorie doit être un identifiant MongoDB valide.'),
  
  checkValidationResult
];

// Règles de validation pour récupérer les tâches d'un utilisateur
const validateGetTasksByUserId = [
  param('userId').isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

// Règles de validation pour récupérer une tâche spécifique
const validateGetTaskById = [
  param('id').isMongoId().withMessage('L\'ID de la tâche doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

// Règles de validation pour la mise à jour d'une tâche
const validateUpdateTask = [
  param('id').isMongoId().withMessage('L\'ID de la tâche doit être un identifiant MongoDB valide.'),
  body('title').optional().isString().withMessage('Le titre doit être une chaîne de caractères.'),
  body('description').optional().isString().withMessage('La description doit être une chaîne de caractères.'),
  body('status').optional().isIn(['todo', 'in_progress', 'done']).withMessage('Le statut doit être "todo", "in_progress" ou "done".'),
  body('dueDate').optional().isISO8601().withMessage('La date d\'échéance doit être une date valide (format ISO 8601).'),
  body('categoryId').optional().isMongoId().withMessage('L\'ID de la catégorie doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

// Règles de validation pour la suppression d'une tâche
const validateDeleteTask = [
  param('id').isMongoId().withMessage('L\'ID de la tâche doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

module.exports = {
  validateCreateTask, validateGetTasksByUserId, validateGetTaskById, validateUpdateTask, validateDeleteTask
};