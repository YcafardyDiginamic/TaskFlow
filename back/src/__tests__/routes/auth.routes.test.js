const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const AuthController = require('../../controllers/authController');
const cookieParser = require('cookie-parser');

jest.mock('../../controllers/authController');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Test des routes Auth (/api/auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/login devrait appeler AuthController.login', async () => {
    AuthController.login.mockImplementation((req, res) => res.status(200).json({ token: 'fake-jwt' }));

    const response = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'pwd' });

    expect(AuthController.login).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  test('POST /api/auth/refresh devrait appeler AuthController.refresh', async () => {
    AuthController.refresh.mockImplementation((req, res) => res.status(200).json({ token: 'new-jwt' }));
    const response = await request(app).post('/api/auth/refresh').set('Cookie', 'refreshToken=123');
    
    expect(response.status).toBe(200);
  });
});