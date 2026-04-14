import { query } from '../db/connection.js';

const commentSelect = `
  SELECT
    c.id,
    c.post_id,
    c.user_id,
    c.content,
    c.created_at,
    u.name AS user_name,
    u.profile_pic_url
  FROM comments c
  INNER JOIN users u ON u.id = c.user_id
`;

const CommentModel = {
  async create(payload) {
    const result = await query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [payload.post_id, payload.user_id, payload.content]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`${commentSelect} WHERE c.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findAll() {
    return query(`${commentSelect} ORDER BY c.created_at DESC, c.id DESC`);
  },

  async findByPostId(postId) {
    return query(
      `${commentSelect} WHERE c.post_id = ? ORDER BY c.created_at ASC, c.id ASC`,
      [postId]
    );
  },

  async update(id, payload) {
    if (payload.content === undefined) {
      return this.findById(id);
    }

    await query('UPDATE comments SET content = ? WHERE id = ?', [
      payload.content,
      id,
    ]);

    return this.findById(id);
  },

  async delete(id) {
    const existingComment = await this.findById(id);

    if (!existingComment) {
      return null;
    }

    await query('DELETE FROM comments WHERE id = ?', [id]);
    return existingComment;
  },
};

export default CommentModel;
