const authMiddleware = require('../../middlewares/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

const mockRequest = (authHeader) => ({
  header: jest.fn().mockReturnValue(authHeader)
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Test unitaire - Middleware Auth', () => {
  let res;
  let next;

  beforeEach(() => {
    res = mockResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('Devrait bloquer (401) si aucun header Authorization n\'est présent', () => {
    const req = mockRequest(null);
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Devrait bloquer (401) si le token est invalide', () => {
    const req = mockRequest('Bearer invalid-token');
    jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('Devrait passer (next) et attacher req.user si le token est valide', () => {
    const req = mockRequest('Bearer valid-token');
    const decodedPayload = { userId: '123' };
    jwt.verify.mockReturnValue(decodedPayload);
    authMiddleware(req, res, next);
    expect(req.user).toEqual(decodedPayload);
  });
});