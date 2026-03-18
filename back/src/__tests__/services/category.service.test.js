const mongoose = require('mongoose');
const { describe, test, expect, beforeAll, afterAll, afterEach } = require('@jest/globals');
const { connect, closeDatabase, clearDatabase } = require('../db.setup');
const Category = require('../../models/category.models');
const CategoryService = require('../../services/categoryService'); // Classe à créer ensuite

describe('Test unitaire du Service CategoryService (CRUD)', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  const mockUserId = new mongoose.Types.ObjectId();

  test('Devrait créer une nouvelle catégorie (Create)', async () => {
    const categoryData = {
      name: 'Projet de Fin d\'Étude',
      color: '#FF5733',
      userId: mockUserId
    };

    const createdCategory = await CategoryService.createCategory(categoryData);

    expect(createdCategory).toBeDefined();
    expect(createdCategory._id).toBeDefined();
    expect(createdCategory.name).toBe('Projet de Fin d\'Étude');
    expect(createdCategory.color).toBe('#FF5733');
  });

  test('Devrait récupérer toutes les catégories d\'un utilisateur (Read All)', async () => {
    await Category.create([
      { name: 'Cat 1', userId: mockUserId },
      { name: 'Cat 2', userId: mockUserId },
      { name: 'Cat 3', userId: new mongoose.Types.ObjectId() } // Appartient à un autre utilisateur
    ]);

    const categories = await CategoryService.getCategoriesByUserId(mockUserId);

    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Cat 1' }),
        expect.objectContaining({ name: 'Cat 2' }),
      ])
    );
  });

  test('Devrait récupérer une catégorie par son ID (Read One)', async () => {
    const category = await Category.create({ name: 'Unique', userId: mockUserId });
    const foundCategory = await CategoryService.getCategoryById(category._id);

    expect(foundCategory).not.toBeNull();
    expect(foundCategory.name).toBe('Unique');
  });

  test('Devrait mettre à jour une catégorie (Update)', async () => {
    const category = await Category.create({ name: 'A Update', userId: mockUserId });
    const updatedCategory = await CategoryService.updateCategory(category._id, { color: '#000000' });

    expect(updatedCategory.name).toBe('A Update');
    expect(updatedCategory.color).toBe('#000000');
  });

  test('Devrait supprimer une catégorie (Delete)', async () => {
    const category = await Category.create({ name: 'A Supprimer', userId: mockUserId });
    const deletedCategory = await CategoryService.deleteCategory(category._id);
    const categoryInDb = await Category.findById(category._id);

    expect(deletedCategory).toBeDefined();
    expect(categoryInDb).toBeNull();
  });

  describe('Cas d\'erreurs (Validation Sémantique & État DB)', () => {
    test('Devrait retourner null si on tente de récupérer une catégorie inexistante (Non trouvé)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const foundCategory = await CategoryService.getCategoryById(fakeId);
      expect(foundCategory).toBeNull();
    });
  });
});