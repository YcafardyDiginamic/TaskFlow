const { describe, test, expect, beforeEach } = require('@jest/globals');
const TaskController = require('../../controllers/taskController'); // Classe à créer ensuite
const TaskService = require('../../services/taskService');

// On "mock" (simule) le module TaskService pour isoler le Controller
jest.mock('../../services/taskService');

// Utilitaires pour simuler les objets Express (Request et Response)
const mockRequest = (data = {}) => ({ ...data });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test unitaire du Controller TaskController', () => {
  beforeEach(() => {
    // Réinitialise les compteurs des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    test('Devrait créer une tâche et retourner le statut 201 (Created)', async () => {
      const req = mockRequest({ body: { title: 'Nouvelle tâche', userId: '123' } });
      const res = mockResponse();
      
      // On simule la réponse du Service
      const mockCreatedTask = { _id: 'abc', title: 'Nouvelle tâche', status: 'todo' };
      TaskService.createTask.mockResolvedValue(mockCreatedTask);

      await TaskController.createTask(req, res);

      expect(TaskService.createTask).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedTask);
    });

    test('Devrait attraper les erreurs du service et retourner le statut 400 (Bad Request)', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      
      TaskService.createTask.mockRejectedValue(new Error('Le titre est obligatoire'));

      await TaskController.createTask(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Le titre est obligatoire' });
    });
  });

  describe('getTasksByUserId', () => {
    test('Devrait retourner la liste des tâches et le statut 200 (OK)', async () => {
      const req = mockRequest({ params: { userId: '123' } });
      const res = mockResponse();
      
      const mockTasks = [{ title: 'Task 1' }, { title: 'Task 2' }];
      TaskService.getTasksByUserId.mockResolvedValue(mockTasks);

      await TaskController.getTasksByUserId(req, res);

      expect(TaskService.getTasksByUserId).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTasks);
    });

    test('Devrait retourner 500 en cas d\'erreur interne', async () => {
      const req = mockRequest({ params: { userId: '123' } });
      const res = mockResponse();
      
      TaskService.getTasksByUserId.mockRejectedValue(new Error('Erreur DB'));
      await TaskController.getTasksByUserId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getTaskById', () => {
    test('Devrait retourner la tâche et le statut 200 si elle existe', async () => {
      const req = mockRequest({ params: { id: 'abc' } });
      const res = mockResponse();
      
      TaskService.getTaskById.mockResolvedValue({ _id: 'abc', title: 'Task' });

      await TaskController.getTaskById(req, res);

      expect(TaskService.getTaskById).toHaveBeenCalledWith('abc');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Devrait retourner une erreur 404 (Not Found) si la tâche n\'existe pas en base', async () => {
      const req = mockRequest({ params: { id: 'unknown' } });
      const res = mockResponse();
      
      TaskService.getTaskById.mockResolvedValue(null); // Le service retourne null selon notre DAT

      await TaskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tâche non trouvée' });
    });

    test('Devrait retourner 500 en cas d\'erreur interne', async () => {
      const req = mockRequest({ params: { id: 'abc' } });
      const res = mockResponse();
      
      TaskService.getTaskById.mockRejectedValue(new Error('Erreur DB'));
      await TaskController.getTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateTask', () => {
    test('Devrait mettre à jour et retourner 200', async () => {
      const req = mockRequest({ params: { id: 'abc' }, body: { status: 'done' } });
      const res = mockResponse();
      
      TaskService.updateTask.mockResolvedValue({ _id: 'abc', status: 'done' });

      await TaskController.updateTask(req, res);

      expect(TaskService.updateTask).toHaveBeenCalledWith('abc', { status: 'done' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Devrait retourner 400 si le service rejette la mise à jour (ex: statut invalide)', async () => {
      const req = mockRequest({ params: { id: 'abc' }, body: { status: 'inconnu' } });
      const res = mockResponse();
      
      TaskService.updateTask.mockRejectedValue(new Error('Statut invalide'));
      await TaskController.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteTask', () => {
    test('Devrait supprimer la tâche et retourner 204 (No Content)', async () => {
      const req = mockRequest({ params: { id: 'abc' } });
      const res = mockResponse();
      
      TaskService.deleteTask.mockResolvedValue({ _id: 'abc' });

      await TaskController.deleteTask(req, res);

      expect(TaskService.deleteTask).toHaveBeenCalledWith('abc');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    test('Devrait retourner 500 en cas d\'erreur interne', async () => {
      const req = mockRequest({ params: { id: 'abc' } });
      const res = mockResponse();
      
      TaskService.deleteTask.mockRejectedValue(new Error('Erreur DB'));
      await TaskController.deleteTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});