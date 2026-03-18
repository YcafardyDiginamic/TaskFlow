const { body, param, validationResult } = require('express-validator');

// Middleware commun pour intercepter les erreurs trouvées par express-validator
const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn("⚠️ Échec de la validation syntaxique :", errors.array());
    return res.status(400).json({
      message: 'Erreur de validation syntaxique',
      errors: errors.array()
    });
  }
  next();
};

// Règles de validation pour la création d'un utilisateur
const validateCreateUser = [
  body('username')
    .exists({ checkFalsy: true }).withMessage('Le nom d\'utilisateur est obligatoire.')
    .isString().withMessage('Le nom d\'utilisateur doit être une chaîne de caractères.')
    .isLength({ min: 3, max: 50 }).withMessage('Le nom d\'utilisateur doit faire entre 3 et 50 caractères.'),
  
  body('email')
    .exists({ checkFalsy: true }).withMessage('L\'email est obligatoire.')
    .isEmail().withMessage('Format d\'email invalide.'),
  
  body('password')
    .exists({ checkFalsy: true }).withMessage('Le mot de passe est obligatoire.')
    .isString().withMessage('Le mot de passe doit être une chaîne de caractères.')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères.'),
  
  checkValidationResult
];

// Règles de validation pour récupérer un utilisateur
const validateGetUserById = [
  param('id').isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

// Règles de validation pour la mise à jour d'un utilisateur
const validateUpdateUser = [
  param('id').isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),
  
  body('username').optional().isString().isLength({ min: 3, max: 50 }).withMessage('Le nom d\'utilisateur doit faire entre 3 et 50 caractères.'),
  body('email').optional().isEmail().withMessage('Format d\'email invalide.'),
  body('password').optional().isString().isLength({ min: 6 }).withMessage('Le mot de passe doit faire au moins 6 caractères.'),
  
  checkValidationResult
];

// Règles de validation pour la suppression d'un utilisateur
const validateDeleteUser = [
  param('id').isMongoId().withMessage('L\'ID de l\'utilisateur doit être un identifiant MongoDB valide.'),
  checkValidationResult
];

module.exports = {
  validateCreateUser,
  validateGetUserById,
  validateUpdateUser,
  validateDeleteUser,
  checkValidationResult
};