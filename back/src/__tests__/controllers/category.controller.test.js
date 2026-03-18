const { describe, test, expect, beforeEach } = require('@jest/globals');
const CategoryController = require('../../controllers/categoryController'); // Fichier à créer ensuite
const CategoryService = require('../../services/categoryService');

// On "mock" le module CategoryService
jest.mock('../../services/categoryService');

const mockRequest = (data = {}) => ({ ...data });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test unitaire du Controller CategoryController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    test('Devrait créer une catégorie et retourner le statut 201 (Created)', async () => {
      const req = mockRequest({ body: { name: 'Urgent', userId: '123' } });
      const res = mockResponse();
      
      const mockCreatedCategory = { _id: 'cat1', name: 'Urgent', userId: '123' };
      CategoryService.createCategory.mockResolvedValue(mockCreatedCategory);

      await CategoryController.createCategory(req, res);

      expect(CategoryService.createCategory).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedCategory);
    });
  });

  describe('getCategoriesByUserId', () => {
    test('Devrait retourner la liste des catégories et le statut 200 (OK)', async () => {
      const req = mockRequest({ params: { userId: '123' } });
      const res = mockResponse();
      
      const mockCategories = [{ name: 'Urgent' }, { name: 'Maison' }];
      CategoryService.getCategoriesByUserId.mockResolvedValue(mockCategories);

      await CategoryController.getCategoriesByUserId(req, res);

      expect(CategoryService.getCategoriesByUserId).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });
  });

  describe('updateCategory', () => {
    test('Devrait mettre à jour et retourner 200', async () => {
      const req = mockRequest({ params: { id: 'cat1' }, body: { name: 'Très Urgent' } });
      const res = mockResponse();
      
      CategoryService.updateCategory.mockResolvedValue({ _id: 'cat1', name: 'Très Urgent' });

      await CategoryController.updateCategory(req, res);

      expect(CategoryService.updateCategory).toHaveBeenCalledWith('cat1', { name: 'Très Urgent' });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteCategory', () => {
    test('Devrait supprimer la catégorie et retourner 204 (No Content)', async () => {
      const req = mockRequest({ params: { id: 'cat1' } });
      const res = mockResponse();
      
      CategoryService.deleteCategory.mockResolvedValue({ _id: 'cat1' });

      await CategoryController.deleteCategory(req, res);

      expect(CategoryService.deleteCategory).toHaveBeenCalledWith('cat1');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});