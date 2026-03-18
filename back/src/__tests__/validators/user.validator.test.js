const request = require('supertest');
const express = require('express');
const { validateCreateUser, validateGetUserById, validateUpdateUser, validateDeleteUser } = require('../../validators/userValidator');

const app = express();
app.use(express.json());

// Déclaration de routes de test pour l'isolation et la validation des middlewares
app.post('/test-users', validateCreateUser, (req, res) => res.status(200).json({ message: 'OK' }));
app.get('/test-users/:id', validateGetUserById, (req, res) => res.status(200).json({ message: 'OK' }));
app.put('/test-users/:id', validateUpdateUser, (req, res) => res.status(200).json({ message: 'OK' }));
app.delete('/test-users/:id', validateDeleteUser, (req, res) => res.status(200).json({ message: 'OK' }));

describe('Test unitaire - Middleware UserValidator (express-validator)', () => {
  
  describe('validateCreateUser', () => {
    test('Devrait passer au contrôleur (200) si la requête est syntaxiquement valide', async () => {
      const response = await request(app)
        .post('/test-users')
        .send({ username: 'johndoe', email: 'john@test.com', password: 'Password123!' });

      expect(response.status).toBe(200);
    });

    test('Devrait bloquer et retourner 400 si l\'email a un mauvais format', async () => {
      const response = await request(app)
        .post('/test-users')
        .send({ username: 'johndoe', email: 'not-an-email', password: 'Password123!' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Erreur de validation syntaxique');
      // Le composant express-validator retourne un tableau contenant les erreurs
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Format d\'email invalide.' })
        ])
      );
    });

    test('Devrait bloquer et retourner 400 si des champs requis manquent', async () => {
      const response = await request(app)
        .post('/test-users')
        .send({ username: 'johndoe' }); // Absence des champs obligatoires : email et password

      expect(response.status).toBe(400);
      
      // Vérification de la présence d'au moins deux erreurs correspondant aux champs manquants
      const errorFields = response.body.errors.map(err => err.path);
      expect(errorFields).toContain('email');
      expect(errorFields).toContain('password');
    });
  });

  describe('validateGetUserById', () => {
    test('Devrait passer (200) si l\'ID est un MongoID valide', async () => {
      const response = await request(app).get('/test-users/507f1f77bcf86cd799439011');
      expect(response.status).toBe(200);
    });

    test('Devrait bloquer (400) si l\'ID n\'est pas un MongoID', async () => {
      const response = await request(app).get('/test-users/invalid-id');
      expect(response.status).toBe(400);
    });
  });

  describe('validateUpdateUser', () => {
    test('Devrait passer avec un ID valide et un body partiel correct', async () => {
      const response = await request(app)
        .put('/test-users/507f1f77bcf86cd799439011')
        .send({ email: 'new@test.com' }); // Modification isolée de l'email (champ optionnel)
      expect(response.status).toBe(200);
    });

    test('Devrait bloquer (400) si le champ optionnel fourni est invalide', async () => {
      const response = await request(app)
        .put('/test-users/507f1f77bcf86cd799439011')
        .send({ email: 'not-an-email' }); // Injection d'un format d'email invalide
      expect(response.status).toBe(400);
    });
  });

  describe('validateDeleteUser', () => {
    test('Devrait bloquer (400) si l\'ID n\'est pas un MongoID', async () => {
      // Utilisation d'un identifiant ne respectant pas le format hexadécimal de 24 caractères
      const response = await request(app).delete('/test-users/12345');
      expect(response.status).toBe(400);
    });
  });

});