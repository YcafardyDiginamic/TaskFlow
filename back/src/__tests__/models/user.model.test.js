const mongoose = require('mongoose');
const { describe, test, expect, beforeAll, afterAll, afterEach } = require('@jest/globals');
const { connect, closeDatabase, clearDatabase } = require('../db.setup');
const User = require('../../models/user.models');

describe('Test unitaire du Modèle User (Auth / Bcrypt)', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  const rawPassword = 'SuperSecretPassword123!';

  test('Devrait hasher le mot de passe lors de la création de l\'utilisateur', async () => {
    const user = await User.create({
      username: 'authuser',
      email: 'auth@test.com',
      passwordHash: rawPassword, // On passe le mot de passe en clair ici
    });

    // On récupère l'utilisateur en forçant la sélection du passwordHash (qui est en select: false)
    const savedUser = await User.findById(user._id).select('+passwordHash');
    
    expect(savedUser.passwordHash).toBeDefined();
    expect(savedUser.passwordHash).not.toBe(rawPassword);
    expect(savedUser.passwordHash.startsWith('$2b$')).toBe(true); // Signature standard de bcrypt
  });

  test('Devrait retourner true pour un mot de passe correct et false pour un incorrect', async () => {
    const user = await User.create({
      username: 'authuser2',
      email: 'auth2@test.com',
      passwordHash: rawPassword,
    });

    const isMatch = await user.comparePassword(rawPassword);
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('WrongPassword!');
    expect(isNotMatch).toBe(false);
  });

  test('Devrait hasher à nouveau le mot de passe lors de sa modification (via save)', async () => {
    const user = await User.create({
      username: 'authuser3',
      email: 'auth3@test.com',
      passwordHash: rawPassword,
    });

    user.passwordHash = 'NewSuperPassword123!';
    await user.save();

    const updatedUser = await User.findById(user._id).select('+passwordHash');
    expect(updatedUser.passwordHash).not.toBe('NewSuperPassword123!');
    expect(updatedUser.passwordHash.startsWith('$2b$')).toBe(true);
  });

  test('Devrait hasher le mot de passe lors d\'une mise à jour (via findOneAndUpdate)', async () => {
    const user = await User.create({
      username: 'authuser4',
      email: 'auth4@test.com',
      passwordHash: rawPassword,
    });

    await User.findOneAndUpdate({ _id: user._id }, { passwordHash: 'AnotherPassword!' });

    const updatedUser = await User.findById(user._id).select('+passwordHash');
    expect(updatedUser.passwordHash).not.toBe('AnotherPassword!');
    expect(updatedUser.passwordHash.startsWith('$2b$')).toBe(true);
  });
});