const request = require('supertest');
const express = require('express');
const taskRoutes = require('../../routes/taskRoutes'); // Fichier à créer ensuite
const TaskController = require('../../controllers/taskController');

// On "mock" le contrôleur pour isoler la couche Route
jest.mock('../../controllers/taskController');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Test des routes Task (/api/tasks)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/tasks devrait appeler TaskController.createTask', async () => {
    // On simule la réponse du contrôleur
    TaskController.createTask.mockImplementation((req, res) => res.status(201).json({ _id: '507f1f77bcf86cd799439011' }));

    const response = await request(app)
      .post('/api/tasks')
      .send({ title: 'Nouvelle tâche', userId: '507f1f77bcf86cd799439011' }); // ID valide

    expect(TaskController.createTask).toHaveBeenCalled();
    expect(response.status).toBe(201);
  });

  test('GET /api/tasks/user/:userId devrait appeler TaskController.getTasksByUserId', async () => {
    TaskController.getTasksByUserId.mockImplementation((req, res) => res.status(200).json([{ title: 'Task 1' }]));

    const response = await request(app).get('/api/tasks/user/507f1f77bcf86cd799439011');

    expect(TaskController.getTasksByUserId).toHaveBeenCalled();
    // On vérifie que le paramètre "userId" est bien extrait par Express
    expect(TaskController.getTasksByUserId.mock.calls[0][0].params.userId).toBe('507f1f77bcf86cd799439011');
    expect(response.status).toBe(200);
  });

  test('GET /api/tasks/:id devrait appeler TaskController.getTaskById', async () => {
    TaskController.getTaskById.mockImplementation((req, res) => res.status(200).json({ _id: '507f1f77bcf86cd799439011' }));

    const response = await request(app).get('/api/tasks/507f1f77bcf86cd799439011');

    expect(TaskController.getTaskById).toHaveBeenCalled();
    expect(TaskController.getTaskById.mock.calls[0][0].params.id).toBe('507f1f77bcf86cd799439011');
    expect(response.status).toBe(200);
  });

  test('PUT /api/tasks/:id devrait appeler TaskController.updateTask', async () => {
    TaskController.updateTask.mockImplementation((req, res) => res.status(200).json({ _id: '507f1f77bcf86cd799439011' }));

    const response = await request(app)
      .put('/api/tasks/507f1f77bcf86cd799439011')
      .send({ status: 'done' }); // Status valide (minuscule)

    expect(TaskController.updateTask).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('DELETE /api/tasks/:id devrait appeler TaskController.deleteTask', async () => {
    TaskController.deleteTask.mockImplementation((req, res) => res.status(204).send());

    const response = await request(app).delete('/api/tasks/507f1f77bcf86cd799439011');

    expect(TaskController.deleteTask).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });
});