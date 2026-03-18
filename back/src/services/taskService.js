const Task = require('../models/task.models');

class TaskService {
  // Créer une nouvelle tâche
  static async createTask(taskData) {
    return await Task.create(taskData);
  }

  // Récupérer toutes les tâches d'un utilisateur
  static async getTasksByUserId(userId) {
    return await Task.find({ userId });
  }

  // Récupérer une tâche par son ID
  static async getTaskById(taskId) {
    return await Task.findById(taskId);
  }

  // Mettre à jour une tâche existante (avec runValidators pour respecter les enums Mongoose)
  static async updateTask(taskId, updateData) {
    return await Task.findByIdAndUpdate(taskId, updateData, { returnDocument: 'after', runValidators: true });
  }

  // Supprimer une tâche
  static async deleteTask(taskId) {
    return await Task.findByIdAndDelete(taskId);
  }
}

module.exports = TaskService;