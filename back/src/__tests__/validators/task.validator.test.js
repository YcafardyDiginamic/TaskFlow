const request = require('supertest');
const express = require('express');
const {
  validateCreateTask,
  validateGetTasksByUserId,
  validateGetTaskById,
  validateUpdateTask,
  validateDeleteTask
} = require('../../validators/taskValidator');

const app = express();
app.use(express.json());

// Routes fictives pour tester uniquement les middlewares
app.post('/test-tasks', validateCreateTask, (req, res) => res.status(200).json({ message: 'OK' }));
app.get('/test-tasks/user/:userId', validateGetTasksByUserId, (req, res) => res.status(200).json({ message: 'OK' }));
app.get('/test-tasks/:id', validateGetTaskById, (req, res) => res.status(200).json({ message: 'OK' }));
app.put('/test-tasks/:id', validateUpdateTask, (req, res) => res.status(200).json({ message: 'OK' }));
app.delete('/test-tasks/:id', validateDeleteTask, (req, res) => res.status(200).json({ message: 'OK' }));

describe('Test unitaire - Middleware TaskValidator (express-validator)', () => {
  const validMongoId = '507f1f77bcf86cd799439011';

  describe('validateCreateTask', () => {
    test('Devrait passer (200) si la requête est syntaxiquement valide', async () => {
      const response = await request(app)
        .post('/test-tasks')
        .send({ title: 'Nouvelle tâche', userId: validMongoId }); // Champs obligatoires

      expect(response.status).toBe(200);
    });

    test('Devrait bloquer (400) si des champs requis manquent', async () => {
      const response = await request(app)
        .post('/test-tasks')
        .send({ description: 'Sans titre ni userId' });

      expect(response.status).toBe(400);
      const errorFields = response.body.errors.map(err => err.path);
      expect(errorFields).toContain('title');
      expect(errorFields).toContain('userId');
    });

    test('Devrait bloquer (400) si le status ou la dueDate ont un format invalide', async () => {
      const response = await request(app)
        .post('/test-tasks')
        .send({ 
          title: 'Tâche', 
          userId: validMongoId, 
          status: 'Inconnu', // Statut non autorisé
          dueDate: 'pas-une-date' // Mauvais format de date
        });

      expect(response.status).toBe(400);
      const errorFields = response.body.errors.map(err => err.path);
      expect(errorFields).toContain('status');
      expect(errorFields).toContain('dueDate');
    });
  });

  describe('validateGetTasksByUserId', () => {
    test('Devrait bloquer (400) si le userId n\'est pas un MongoID valide', async () => {
      const response = await request(app).get('/test-tasks/user/123');
      expect(response.status).toBe(400);
    });
  });

  describe('validateGetTaskById', () => {
    test('Devrait bloquer (400) si l\'ID n\'est pas un MongoID', async () => {
      const response = await request(app).get('/test-tasks/123');
      expect(response.status).toBe(400);
    });
  });

  describe('validateUpdateTask', () => {
    test('Devrait passer avec un ID valide et un body partiel correct', async () => {
      const response = await request(app)
        .put(`/test-tasks/${validMongoId}`)
        .send({ status: 'done', dueDate: '2026-03-15T00:00:00Z' });
      expect(response.status).toBe(200);
    });
  });

  describe('validateDeleteTask', () => {
    test('Devrait bloquer (400) si l\'ID n\'est pas un MongoID', async () => {
      const response = await request(app).delete('/test-tasks/invalid-id');
      expect(response.status).toBe(400);
    });
  });
});