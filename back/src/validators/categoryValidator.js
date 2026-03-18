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

// Règles de validation pour la création d'une catégorie
const validateCreateCategory = [
  body('name').exists({ checkFalsy: true }).withMessage('Le nom de la catégorie est obligatoire.').isString().withMessage('Le nom doit être une chaîne de caractères.'),
  body('userId').exists({ checkFalsy: true }).withMessage('L\'ID de l\'utilisateur est obligatoire.').isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),
  body('color').optional().isString().withMessage('La couleur doit être une chaîne de caractères.'),
  checkValidationResult
];

// Règles de validation pour récupérer les catégories d'un utilisateur
const validateGetCategoriesByUserId = [
  param('userId').isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

// Règles de validation pour la mise à jour d'une catégorie
const validateUpdateCategory = [
  param('id').isMongoId().withMessage('L\'ID de la catégorie doit être un identifiant MongoDB valide.'),
  body('name').optional().isString().withMessage('Le nom doit être une chaîne de caractères.'),
  body('color').optional().isString().withMessage('La couleur doit être une chaîne de caractères.'),
  checkValidationResult
];

// Règles de validation pour la suppression d'une catégorie
const validateDeleteCategory = [
  param('id').isMongoId().withMessage('L\'ID de la catégorie doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

module.exports = {
  validateCreateCategory, validateGetCategoriesByUserId, validateUpdateCategory, validateDeleteCategory
};