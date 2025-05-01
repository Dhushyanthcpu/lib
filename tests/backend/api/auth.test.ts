import { createMocks } from 'node-mocks-http';
import loginHandler from '../../../pages/api/auth/login';
import registerHandler from '../../../pages/api/auth/register';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockImplementation((password, hash) => {
    // For testing, just check if password is 'password123'
    return Promise.resolve(password === 'password123');
  }),
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword')
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token')
}));

// Mock QuantumResistantCrypto
jest.mock('../../../blockchain/quantum-resistant/QuantumResistantCrypto', () => {
  return {
    QuantumResistantCrypto: jest.fn().mockImplementation(() => {
      return {
        generateKeyPair: jest.fn().mockResolvedValue({
          publicKey: 'test-public-key',
          privateKey: 'test-private-key'
        })
      };
    }),
    PostQuantumAlgorithm: {
      DILITHIUM: 'DILITHIUM'
    },
    KeyType: {
      SIGNATURE: 'signature'
    }
  };
});

describe('Auth API Endpoints', () => {
  describe('Login API', () => {
    it('returns 405 for non-POST requests', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Method not allowed' });
    });

    it('returns 400 if email or password is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com'
          // Missing password
        }
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Email and password are required' });
    });

    it('returns 400 for invalid credentials', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        }
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Invalid credentials' });
    });

    it('returns 200 and token for valid credentials', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'demo@example.com',
          password: 'password123'
        }
      });

      await loginHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('email', 'demo@example.com');
    });
  });

  describe('Register API', () => {
    it('returns 405 for non-POST requests', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Method not allowed' });
    });

    it('returns 400 if required fields are missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          // Missing username and password
        }
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({ error: 'Username, email, and password are required' });
    });

    it('returns 201 and token for successful registration', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          username: 'testuser',
          email: 'newuser@example.com',
          password: 'password123',
          language: 'en'
        }
      });

      await registerHandler(req, res);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user).toHaveProperty('username', 'testuser');
      expect(data.user).toHaveProperty('email', 'newuser@example.com');
    });
  });
});