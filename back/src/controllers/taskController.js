const TaskService = require('../services/taskService');

class TaskController {
  static async createTask(req, res) {
    try {
      const task = await TaskService.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getTasksByUserId(req, res) {
    try {
      const tasks = await TaskService.getTasksByUserId(req.params.userId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getTaskById(req, res) {
    try {
      const task = await TaskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Tâche non trouvée' });
      }
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateTask(req, res) {
    try {
      const task = await TaskService.updateTask(req.params.id, req.body);
      res.status(200).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteTask(req, res) {
    try {
      await TaskService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TaskController;