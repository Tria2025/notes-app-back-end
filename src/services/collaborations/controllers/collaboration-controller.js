import CollaborationRepositories from '../repositories/collaboration-repositories.js';
import NoteRepositories from '../../notes/repositories/note-repositories.js';
import response from '../../../utils/response.js';
import AuthorizationError from '../../../exceptions/authorization-error.js';
import NotFoundError from '../../../exceptions/not-found-error.js';
import UserRepositories from '../../users/repositories/user-repositories.js';

export const addCollaboration = async (req, res, next) => {
  const { id: credentialId } = req.user;

  const { noteId, userId } = req.validated;

  const user = await UserRepositories.getUserById(userId);

  if (!user) {
    return next(new NotFoundError('User tidak ditemukan'));
  }

  const isOwner = await NoteRepositories.verifyNoteOwner(noteId, credentialId);

  if (!isOwner) {
    return next(new AuthorizationError('Anda tidak berhak mengakses resource ini'));
  }

  const collaboration = await CollaborationRepositories.addCollaboration(noteId, userId);

  return response(res, 201, 'Kolaborasi berhasil ditambahkan', {
    collaborationId: collaboration,
  });
};

export const deleteCollaboration = async (req, res, next) => {
  const { noteId, userId } = req.validated;
  const { id: credentialId } = req.user;

  const isOwner = await NoteRepositories.verifyNoteOwner(noteId, credentialId);
  if (!isOwner) {
    return next(new AuthorizationError('Anda tidak berhak mengakses resource ini'));
  }

  await CollaborationRepositories.deleteCollaboration(noteId, userId);

  return response(res, 200, 'Kolaborasi berhasil dihapus', null);
};
