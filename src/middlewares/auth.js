import TokenManager from '../security/token-manager.js';
import response from '../utils/response.js';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response(res, 401, 'Unauthorized', null);
  }

  try {
    const accessToken = authHeader.split(' ')[1];

    const user = await TokenManager.verify(
      accessToken,
      process.env.ACCESS_TOKEN_KEY
    );

    req.user = user;

    return next();
  } catch (error) {
    return response(res, 401, error.message, null);
  }
}

export default authenticateToken;