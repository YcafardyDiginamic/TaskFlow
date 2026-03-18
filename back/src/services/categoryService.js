const Category = require('../models/category.models');

class CategoryService {
  // Créer une nouvelle catégorie
  static async createCategory(categoryData) {
    return await Category.create(categoryData);
  }

  // Récupérer toutes les catégories d'un utilisateur
  static async getCategoriesByUserId(userId) {
    return await Category.find({ userId });
  }

  // Récupérer une catégorie par son ID
  static async getCategoryById(categoryId) {
    return await Category.findById(categoryId);
  }

  // Mettre à jour une catégorie
  static async updateCategory(categoryId, updateData) {
    return await Category.findByIdAndUpdate(categoryId, updateData, { returnDocument: 'after', runValidators: true });
  }

  // Supprimer une catégorie
  static async deleteCategory(categoryId) {
    return await Category.findByIdAndDelete(categoryId);
  }
}

module.exports = CategoryService;