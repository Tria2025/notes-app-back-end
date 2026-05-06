import UserRepositories from '../repositories/user-repositories.js';
import response from '../../../utils/response.js';
import InvariantError from '../../../exceptions/invariant-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';

const userRepository = new UserRepositories();

export const createUser = async (req, res, next) => {
  const { username, password, fullname } = req.validated;

  const isUsernameExist = await userRepository.verifyNewUsername(username);
  if (isUsernameExist) {
    return next(new InvariantError('Gagal menambahkan user. Username sudah digunakan.'));
  }

  const user = await userRepository.createUser({
    username,
    password,
    fullname,
  });

  if (!user) {
    return next(new InvariantError('User gagal ditambahkan'));
  }

  return response(res, 201, 'User berhasil ditambahkan', user);
};

export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  const user = await userRepository.getUserById(id);

  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }

  return response(res, 200, 'User berhasil ditampilkan', {
    user: {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
    }
  });
};