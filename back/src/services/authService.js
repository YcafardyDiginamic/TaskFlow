const User = require('../models/user.models');
const jwt = require('jsonwebtoken');

class AuthService {
  static async login(email, password) {
    // On récupère l'utilisateur en forçant la sélection du passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    // On vérifie le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Email ou mot de passe incorrect.');
    }

    // On génère les deux JWT
    const payload = { userId: user._id };
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
    
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

    return { accessToken, refreshToken, user: user.toJSON() };
  }

  static async refresh(refreshToken) {
    if (!refreshToken) {
      throw new Error('Refresh token manquant.');
    }
    
    try {
      const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
      const decoded = jwt.verify(refreshToken, refreshSecret);
      
      const user = await User.findById(decoded.userId);
      if (!user) throw new Error('Utilisateur non trouvé.');

      const accessSecret = process.env.JWT_ACCESS_SECRET || 'access_secret';
      const newAccessToken = jwt.sign({ userId: user._id }, accessSecret, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' });

      return { token: newAccessToken };
    } catch (error) {
      throw new Error('Refresh token expiré ou invalide.');
    }
  }
}

module.exports = AuthService;