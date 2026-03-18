const request = require('supertest');
const express = require('express');
const {
  validateCreateCategory,
  validateGetCategoriesByUserId,
  validateUpdateCategory,
  validateDeleteCategory
} = require('../../validators/categoryValidator');

const app = express();
app.use(express.json());

// Routes fictives pour tester les middlewares
app.post('/test-categories', validateCreateCategory, (req, res) => res.status(200).json({ message: 'OK' }));
app.get('/test-categories/user/:userId', validateGetCategoriesByUserId, (req, res) => res.status(200).json({ message: 'OK' }));
app.put('/test-categories/:id', validateUpdateCategory, (req, res) => res.status(200).json({ message: 'OK' }));
app.delete('/test-categories/:id', validateDeleteCategory, (req, res) => res.status(200).json({ message: 'OK' }));

describe('Test unitaire - Middleware CategoryValidator (express-validator)', () => {
  const validMongoId = '507f1f77bcf86cd799439011';

  describe('validateCreateCategory', () => {
    test('Devrait passer (200) si la requête est syntaxiquement valide', async () => {
      const response = await request(app)
        .post('/test-categories')
        .send({ name: 'Projet de Fin d\'Étude', color: '#FF5733', userId: validMongoId });
      expect(response.status).toBe(200);
    });

    test('Devrait bloquer (400) si le nom ou le userId manque', async () => {
      const response = await request(app).post('/test-categories').send({ color: '#FF5733' });
      expect(response.status).toBe(400);
      const errorFields = response.body.errors.map(err => err.path);
      expect(errorFields).toContain('name');
      expect(errorFields).toContain('userId');
    });
  });

  describe('validateGetCategoriesByUserId', () => {
    test('Devrait bloquer (400) si le userId n\'est pas un MongoID', async () => {
      const response = await request(app).get('/test-categories/user/invalid-id');
      expect(response.status).toBe(400);
    });
  });

  describe('validateUpdateCategory', () => {
    test('Devrait passer (200) avec un ID valide et un nom', async () => {
      const response = await request(app)
        .put(`/test-categories/${validMongoId}`)
        .send({ name: 'Urgent' });
      expect(response.status).toBe(200);
    });
    test('Devrait bloquer (400) si l\'ID de la catégorie n\'est pas un MongoID', async () => {
      const response = await request(app).put('/test-categories/invalid-id').send({ name: 'Urgent' });
      expect(response.status).toBe(400);
    });
  });

  describe('validateDeleteCategory', () => {
    test('Devrait bloquer (400) si l\'ID n\'est pas un MongoID', async () => {
      const response = await request(app).delete('/test-categories/12345');
      expect(response.status).toBe(400);
    });
  });
});