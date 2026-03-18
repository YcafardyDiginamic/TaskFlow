const { describe, test, expect, beforeEach } = require('@jest/globals');
const AuthService = require('../../services/authService');
const User = require('../../models/user.models');
const jwt = require('jsonwebtoken');

jest.mock('../../models/user.models');
jest.mock('jsonwebtoken');

describe('Test unitaire - AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait générer un access et un refresh token si les identifiants sont corrects', async () => {
    const mockUser = { 
      _id: '123', 
      email: 'test@test.com', 
      comparePassword: jest.fn().mockResolvedValue(true),
      toJSON: jest.fn().mockReturnValue({ id: '123', email: 'test@test.com' })
    };
    
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    jwt.sign.mockReturnValueOnce('fake-access-token').mockReturnValueOnce('fake-refresh-token');

    const result = await AuthService.login('test@test.com', 'password123');

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
    expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    expect(jwt.sign).toHaveBeenCalledTimes(2);
    
    expect(result.accessToken).toBe('fake-access-token');
    expect(result.refreshToken).toBe('fake-refresh-token');
    expect(result.user.email).toBe('test@test.com');
  });

  test('Devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await expect(AuthService.login('test@test.com', 'pwd')).rejects.toThrow('Email ou mot de passe incorrect.');
  });

  test('Devrait vérifier le refresh token et renvoyer un nouvel access token', async () => {
    jwt.verify.mockReturnValue({ userId: '123' });
    User.findById.mockResolvedValue({ _id: '123', email: 'test@test.com' });
    jwt.sign.mockReturnValue('new-access-token');

    const result = await AuthService.refresh('valid-refresh-token');

    expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', expect.any(String));
    expect(result.token).toBe('new-access-token');
  });
});