const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'API REST de gestion de tâches — Projet CDA',
      contact: {
        name: 'Votre Nom',
        email: 'contact@example.com',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Développement' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT : Bearer <token>',
        },
      },
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Finir le projet CDA' },
            description: { type: 'string', example: 'Tests et README' },
            status: { type: 'string', enum: ['Todo', 'In Progress', 'Done'], example: 'Todo' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'medium' },
            due_date: { type: 'string', format: 'date', example: '2025-03-15' },
            user_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'johndoe' },
            email: { type: 'string', example: 'john@taskflow.com' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Projet de Fin d\'Étude' },
            color: { type: 'string', example: '#FF5733' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Chemins vers les fichiers contenant les annotations
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;