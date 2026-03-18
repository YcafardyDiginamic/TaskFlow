const request = require('supertest');
const express = require('express');
const categoryRoutes = require('../../routes/categoryRoutes'); // Fichier à créer ensuite
const CategoryController = require('../../controllers/categoryController');

// On "mock" le contrôleur pour isoler la couche Route
jest.mock('../../controllers/categoryController');

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('Test des routes Category (/api/categories)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/categories devrait appeler CategoryController.createCategory', async () => {
    CategoryController.createCategory.mockImplementation((req, res) => res.status(201).json({ _id: '507f1f77bcf86cd799439011' }));

    const response = await request(app)
      .post('/api/categories')
      .send({ name: 'Urgent', userId: '507f1f77bcf86cd799439011' });

    expect(CategoryController.createCategory).toHaveBeenCalled();
    expect(response.status).toBe(201);
  });

  test('GET /api/categories/user/:userId devrait appeler CategoryController.getCategoriesByUserId', async () => {
    CategoryController.getCategoriesByUserId.mockImplementation((req, res) => res.status(200).json([{ name: 'Urgent' }]));

    const response = await request(app).get('/api/categories/user/507f1f77bcf86cd799439011');

    expect(CategoryController.getCategoriesByUserId).toHaveBeenCalled();
    expect(CategoryController.getCategoriesByUserId.mock.calls[0][0].params.userId).toBe('507f1f77bcf86cd799439011');
    expect(response.status).toBe(200);
  });

  test('PUT /api/categories/:id devrait appeler CategoryController.updateCategory', async () => {
    CategoryController.updateCategory.mockImplementation((req, res) => res.status(200).json({ _id: '507f1f77bcf86cd799439011' }));

    const response = await request(app)
      .put('/api/categories/507f1f77bcf86cd799439011')
      .send({ name: 'Très Urgent' });

    expect(CategoryController.updateCategory).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('DELETE /api/categories/:id devrait appeler CategoryController.deleteCategory', async () => {
    CategoryController.deleteCategory.mockImplementation((req, res) => res.status(204).send());

    const response = await request(app).delete('/api/categories/507f1f77bcf86cd799439011');

    expect(CategoryController.deleteCategory).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });
});