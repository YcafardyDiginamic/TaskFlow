const User = require('../models/user.models');

class UserService {
  // Créer un utilisateur
  static async createUser(userData) {
    const payload = { ...userData };
    if (payload.password) {
      payload.passwordHash = payload.password;
      delete payload.password;
    }
    return await User.create(payload);
  }

  // Récupérer un utilisateur par son ID
  static async getUserById(userId) {
    return await User.findById(userId);
  }

  // Récupérer un utilisateur par son email (avec le mot de passe pour l'auth)
  static async getUserByEmail(email) {
    return await User.findOne({ email }).select('+passwordHash');
  }

  // Mettre à jour un utilisateur
  static async updateUser(userId, updateData) {
    const payload = { ...updateData };
    if (payload.password) {
      payload.passwordHash = payload.password;
      delete payload.password;
    }
    return await User.findByIdAndUpdate(userId, payload, { returnDocument: 'after', runValidators: true });
  }

  // Supprimer un utilisateur
  static async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }
}

module.exports = UserService;