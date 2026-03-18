const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/userRoutes');
const UserController = require('../../controllers/userController');

// On "mock" le contrôleur pour isoler la couche Route
jest.mock('../../controllers/userController');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('Test des routes User (/api/users)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/users devrait appeler UserController.createUser', async () => {
    // On simule le comportement du contrôleur pour qu'il renvoie une réponse
    UserController.createUser.mockImplementation((req, res) => res.status(201).json({ id: '507f1f77bcf86cd799439011' }));

    const response = await request(app)
      .post('/api/users')
      .send({ username: 'test', email: 'test@test.com', password: 'password123' });

    expect(UserController.createUser).toHaveBeenCalled();
    expect(response.status).toBe(201);
  });

  test('GET /api/users/:id devrait appeler UserController.getUserById', async () => {
    UserController.getUserById.mockImplementation((req, res) => res.status(200).json({ id: '507f1f77bcf86cd799439011' }));

    // On utilise un MongoID valide
    const response = await request(app).get('/api/users/507f1f77bcf86cd799439011');

    expect(UserController.getUserById).toHaveBeenCalled();
    // On vérifie que les paramètres d'URL sont bien transmis par Express au contrôleur
    expect(UserController.getUserById.mock.calls[0][0].params.id).toBe('507f1f77bcf86cd799439011');
    expect(response.status).toBe(200);
  });

  test('PUT /api/users/:id devrait appeler UserController.updateUser', async () => {
    UserController.updateUser.mockImplementation((req, res) => res.status(200).json({ id: '507f1f77bcf86cd799439011' }));

    const response = await request(app)
      .put('/api/users/507f1f77bcf86cd799439011')
      .send({ username: 'newname' });

    expect(UserController.updateUser).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('DELETE /api/users/:id devrait appeler UserController.deleteUser', async () => {
    UserController.deleteUser.mockImplementation((req, res) => res.status(204).send());

    const response = await request(app).delete('/api/users/507f1f77bcf86cd799439011');

    expect(UserController.deleteUser).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });
});