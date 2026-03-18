const { describe, test, expect, beforeEach } = require('@jest/globals');
const AuthController = require('../../controllers/authController');
const AuthService = require('../../services/authService');

jest.mock('../../services/authService');

const mockRequest = (data = {}) => ({ body: {}, cookies: {}, ...data });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test unitaire - AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Devrait retourner 200, un accessToken et placer le refreshToken en cookie', async () => {
    const req = mockRequest({ body: { email: 'test@test.com', password: 'password123' } });
    const res = mockResponse();
    
    AuthService.login.mockResolvedValue({ accessToken: 'fake-access', refreshToken: 'fake-refresh', user: { id: '123' } });
    await AuthController.login(req, res);

    expect(AuthService.login).toHaveBeenCalledWith('test@test.com', 'password123');
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'fake-refresh', expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'fake-access', user: { id: '123' } });
  });

  test('Devrait renouveler le token avec un refresh token en cookie', async () => {
    const req = mockRequest({ cookies: { refreshToken: 'valid-refresh' } });
    const res = mockResponse();
    
    AuthService.refresh.mockResolvedValue({ token: 'new-access' });
    await AuthController.refresh(req, res);
    
    expect(res.json).toHaveBeenCalledWith({ token: 'new-access' });
  });
});