const mongoose = require('mongoose');
const { describe, test, expect, beforeAll, afterAll, afterEach } = require('@jest/globals');
const { connect, closeDatabase, clearDatabase } = require('../db.setup');
const Task = require('../../models/task.models');
const TaskService = require('../../services/taskService'); // C'est cette classe que nous allons créer ensuite

describe('Test unitaire du Service TaskService (CRUD)', () => {
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
  const mockCategoryId = new mongoose.Types.ObjectId();

  test('Devrait créer une nouvelle tâche (Create)', async () => {
    const taskData = {
      title: 'Apprendre le TDD',
      description: 'Faire du Red-Green-Refactor',
      userId: mockUserId,
      categoryId: mockCategoryId,
      dueDate: new Date()
    };

    const createdTask = await TaskService.createTask(taskData);

    expect(createdTask).toBeDefined();
    expect(createdTask._id).toBeDefined();
    expect(createdTask.title).toBe('Apprendre le TDD');
    expect(createdTask.status).toBe('todo'); // Valeur par défaut
  });

  test('Devrait récupérer toutes les tâches d\'un utilisateur spécifique (Read All)', async () => {
    // Préparation : On insère manuellement 2 tâches pour mockUserId et 1 pour un autre utilisateur
    await Task.create([
      { title: 'Task 1', userId: mockUserId },
      { title: 'Task 2', userId: mockUserId },
      { title: 'Task 3', userId: new mongoose.Types.ObjectId() }
    ]);

    const tasks = await TaskService.getTasksByUserId(mockUserId);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });

  test('Devrait récupérer une tâche par son ID (Read One)', async () => {
    const task = await Task.create({ title: 'Tâche unique', userId: mockUserId });

    const foundTask = await TaskService.getTaskById(task._id);

    expect(foundTask).not.toBeNull();
    expect(foundTask.title).toBe('Tâche unique');
  });

  test('Devrait mettre à jour une tâche (Update)', async () => {
    const task = await Task.create({ title: 'Tâche à mettre à jour', userId: mockUserId });

    const updatedTask = await TaskService.updateTask(task._id, {
      status: 'in_progress',
      description: 'Ça avance bien'
    });

    expect(updatedTask.status).toBe('in_progress');
    expect(updatedTask.description).toBe('Ça avance bien');
    expect(updatedTask.title).toBe('Tâche à mettre à jour'); // Ne doit pas avoir changé
  });

  test('Devrait supprimer une tâche (Delete)', async () => {
    const task = await Task.create({ title: 'Tâche à supprimer', userId: mockUserId });

    const deletedTask = await TaskService.deleteTask(task._id);
    const taskInDb = await Task.findById(task._id);

    expect(deletedTask).toBeDefined();
    expect(deletedTask._id.toString()).toBe(task._id.toString());
    expect(taskInDb).toBeNull(); // Vérifie que la tâche a bien disparu de la base
  });

  describe('Cas d\'erreurs (Validation Sémantique & État DB)', () => {
    test('Devrait retourner null si on tente de récupérer une tâche inexistante (Non trouvé)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const foundTask = await TaskService.getTaskById(fakeId);
      expect(foundTask).toBeNull();
    });
  });
});