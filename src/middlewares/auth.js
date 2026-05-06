import TokenManager from '../security/token-manager.js';
import response from '../utils/response.js';
import AuthenticationError from '../exceptions/authentication-error.js';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AuthenticationError('Unauthorized'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    return next(new AuthenticationError('Unauthorized'));
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const user = TokenManager.verify(token, process.env.ACCESS_TOKEN_KEY);

    if (!user) {
      return next(new AuthenticationError('Unauthorized'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new AuthenticationError('Unauthorized'));
  }
};

export default authenticateToken;