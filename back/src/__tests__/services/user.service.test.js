const mongoose = require('mongoose');
const { describe, test, expect, beforeAll, afterAll, afterEach } = require('@jest/globals');
const { connect, closeDatabase, clearDatabase } = require('../db.setup');
const User = require('../../models/user.models');
const UserService = require('../../services/userService'); // Classe à créer ensuite

describe('Test unitaire du Service UserService (CRUD & Auth)', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  const validUserData = {
    username: 'testuser',
    email: 'test@taskflow.com',
    passwordHash: 'SuperSecretPassword123!',
  };

  test('Devrait créer un nouvel utilisateur (Create)', async () => {
    const createdUser = await UserService.createUser(validUserData);

    expect(createdUser).toBeDefined();
    expect(createdUser._id).toBeDefined();
    expect(createdUser.username).toBe('testuser');
    expect(createdUser.email).toBe('test@taskflow.com');
  });

  test('Devrait récupérer un utilisateur par son ID (Read One)', async () => {
    const user = await User.create(validUserData);
    const foundUser = await UserService.getUserById(user._id);

    expect(foundUser).not.toBeNull();
    expect(foundUser.username).toBe('testuser');
  });

  test('Devrait récupérer un utilisateur par son email incluant le passwordHash (Auth)', async () => {
    await User.create(validUserData);
    // Le .select('+passwordHash') sera nécessaire dans le service pour la comparaison bcrypt
    const foundUser = await UserService.getUserByEmail('test@taskflow.com');

    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe('test@taskflow.com');
    expect(foundUser.passwordHash).toBeDefined(); 
  });

  test('Devrait mettre à jour un utilisateur (Update)', async () => {
    const user = await User.create(validUserData);
    const updatedUser = await UserService.updateUser(user._id, { username: 'updateduser' });

    expect(updatedUser.username).toBe('updateduser');
  });

  test('Devrait supprimer un utilisateur (Delete)', async () => {
    const user = await User.create(validUserData);
    const deletedUser = await UserService.deleteUser(user._id);
    const userInDb = await User.findById(user._id);

    expect(deletedUser).toBeDefined();
    expect(userInDb).toBeNull();
  });

  describe('Cas d\'erreurs (Validation Sémantique & État DB)', () => {
    test('Devrait rejeter la création si l\'email est déjà utilisé (Conflit / E11000)', async () => {
      await User.init(); // Assure la création des index Mongoose dans la DB de test locale
      const duplicateData = { username: 'user1', email: 'conflict@taskflow.com', passwordHash: 'pwd' };
      
      await UserService.createUser(duplicateData);
      await expect(UserService.createUser({ username: 'user2', email: 'conflict@taskflow.com', passwordHash: 'pwd' })).rejects.toThrow(/E11000/);
    });

    test('Devrait rejeter la création si le nom d\'utilisateur est déjà pris (Conflit / E11000)', async () => {
      await User.init();
      const duplicateData = { username: 'conflictUser', email: 'user1@taskflow.com', passwordHash: 'pwd' };
      
      await UserService.createUser(duplicateData);
      await expect(UserService.createUser({ username: 'conflictUser', email: 'user2@taskflow.com', passwordHash: 'pwd' })).rejects.toThrow(/E11000/);
    });
  });
});