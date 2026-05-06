import NoteRepositories from '../repositories/note-repositories.js';
import { InvariantError, NotFoundError } from '../../../exceptions/index.js';
import response from '../../../utils/response.js';
import AuthorizationError from '../../../exceptions/authorization-error.js';

export const createNote = async (req, res, next) => {
  const { title, body, tags } = req.validated;
  const { id: owner } = req.user;

  console.log('OWNER SAAT CREATE:', owner);

  const note = await NoteRepositories.createNote({
    title,
    body,
    tags,
    owner
  });

  if (!note) {
    return next(new InvariantError('Catatan gagal ditambahkan'));
  }

  return response(res, 201, 'Catatan berhasil ditambahkan', {
    noteId: note.id,
  });
};

export const getNotes = async (req, res) => {
  const { id: owner } = req.user;
  const notes = await NoteRepositories.getNotes(owner);
  return response(res, 200, 'Catatan sukses ditampilkan', { notes });
};

export const getNoteById = async (req, res, next) => {
  const { id } = req.params;
  const { id: owner } = req.user;

  await NoteRepositories.verifyNoteOwner(id, owner);

  const note = await NoteRepositories.getNoteById(id);

  return response(res, 200, 'Catatan sukses ditampilkan', {
    note,
  });
};

export const editNoteById = async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    body,
    tags
  } = req.validated;

  const { id: owner } = req.user;

  await NoteRepositories.verifyNoteOwner(id, owner);

  const note = await NoteRepositories.editNote({
    id,
    title,
    body,
    tags
  });

  if (!note) {
    return next(new NotFoundError('Catatan tidak ditemukan'));
  }

  return response(res, 200, 'Catatan berhasil diperbarui', {
    note
  });
};

export const deleteNoteById = async (req, res, next) => {
  const { id } = req.params;
  const { id: owner } = req.user;

  await NoteRepositories.verifyNoteOwner(id, owner);

  const deletedNote = await NoteRepositories.deleteNote(id);

  if (!deletedNote) {
    return next(new NotFoundError('Catatan tidak ditemukan'));
  }

  return response(res, 200, 'Catatan berhasil dihapus', {
    deletedNoteId: deletedNote,
  });
};