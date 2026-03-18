const AuthService = require('../services/authService');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      
      // Stockage du Refresh Token dans un cookie HttpOnly sécurisé
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, // Empêche l'accès via document.cookie dans le JS
        secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS en production
        sameSite: 'strict', // Protection contre le CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });

      // Seul l'Access Token est renvoyé en JSON au front
      res.status(200).json({ token: result.accessToken, user: result.user });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const result = await AuthService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}

module.exports = AuthController;