import { Pool } from 'pg';
import { nanoid } from 'nanoid';

class NoteRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createNote({ title, body, tags, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes(id, title, body, tags, created_at, updated_at, owner) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this.pool.query(query);

    return result.rows[0];
  }

  async getNotes(userId) {
    const query = {
      text: `
      SELECT DISTINCT
        notes.id,
        notes.title,
        notes.tags,
        users.username
      FROM notes
      LEFT JOIN users
      ON users.id = notes.owner
      LEFT JOIN collaborations
      ON collaborations.note_id = notes.id
      WHERE notes.owner = $1
      OR collaborations.user_id = $1
    `,
      values: [userId],
    };

    const result = await this.pool.query(query);

    return result.rows;
  }

  async getNoteById(id) {
    const query = {
      text: `
        SELECT
          notes.id,
          notes.title,
          notes.body,
          notes.tags,
          notes.created_at,
          notes.updated_at,
          users.username
        FROM notes
        LEFT JOIN users
        ON users.id = notes.owner
        WHERE notes.id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query(query);

    return result.rows[0];
  }

  async editNote({ id, title, body, tags }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this.pool.query(query);

    return result.rows[0];
  }

  async deleteNote(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      return false;
    }

    return result.rows[0].owner === owner;
  }

  async verifyNoteAccess(noteId, userId) {
    const ownerResult = await this.verifyNoteOwner(noteId, userId);

    if (ownerResult) {
      return true;
    }

    const query = {
      text: 'SELECT * FROM collaborations WHERE note_id = $1 AND user_id = $2',
      values: [noteId, userId],
    };

    const result = await this.pool.query(query);

    return result.rows.length > 0;
  }
}

export default new NoteRepositories();