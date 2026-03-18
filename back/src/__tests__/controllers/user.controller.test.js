const { describe, test, expect, beforeEach } = require('@jest/globals');
const UserController = require('../../controllers/userController'); // Classe à créer ensuite
const UserService = require('../../services/userService');

// On "mock" le module UserService pour isoler le Controller
jest.mock('../../services/userService');

// Utilitaires pour simuler les objets Express (Request et Response)
const mockRequest = (data = {}) => ({ ...data });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test unitaire du Controller UserController (CRUD sans Auth)', () => {
  beforeEach(() => {
    // Réinitialise les compteurs des mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('Devrait créer un utilisateur et retourner le statut 201 (Created)', async () => {
      const req = mockRequest({ body: { username: 'johndoe', email: 'john@test.com', password: 'pwd' } });
      const res = mockResponse();
      
      const mockCreatedUser = { _id: '123', username: 'johndoe', email: 'john@test.com' };
      UserService.createUser.mockResolvedValue(mockCreatedUser);

      await UserController.createUser(req, res);

      expect(UserService.createUser).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedUser);
    });

    test('Devrait attraper les erreurs du service et retourner le statut 400 (Bad Request)', async () => {
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      
      UserService.createUser.mockRejectedValue(new Error('Erreur de validation'));

      await UserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erreur de validation' });
    });
  });

  describe('getUserById', () => {
    test('Devrait retourner l\'utilisateur et le statut 200 si existant', async () => {
      const req = mockRequest({ params: { id: '123' } });
      const res = mockResponse();
      
      UserService.getUserById.mockResolvedValue({ _id: '123', username: 'johndoe' });

      await UserController.getUserById(req, res);

      expect(UserService.getUserById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Devrait retourner 404 si l\'utilisateur n\'existe pas', async () => {
      const req = mockRequest({ params: { id: 'unknown' } });
      const res = mockResponse();
      
      UserService.getUserById.mockResolvedValue(null);

      await UserController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé' });
    });
  });

  describe('updateUser', () => {
    test('Devrait mettre à jour et retourner 200', async () => {
      const req = mockRequest({ params: { id: '123' }, body: { username: 'newname' } });
      const res = mockResponse();
      
      UserService.updateUser.mockResolvedValue({ _id: '123', username: 'newname' });

      await UserController.updateUser(req, res);

      expect(UserService.updateUser).toHaveBeenCalledWith('123', { username: 'newname' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteUser', () => {
    test('Devrait supprimer et retourner 204 (No Content)', async () => {
      const req = mockRequest({ params: { id: '123' } });
      const res = mockResponse();
      
      UserService.deleteUser.mockResolvedValue({ _id: '123' });

      await UserController.deleteUser(req, res);

      expect(UserService.deleteUser).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});