import { query } from '../db/connection.js';

const postBaseSelect = `
  SELECT
    p.id,
    p.user_id,
    p.content,
    p.type,
    p.created_at,
    t.id AS thread_id,
    u.name AS user_name,
    u.profile_pic_url,
    COALESCE(COUNT(DISTINCT l.id), 0) AS like_count,
    COALESCE(COUNT(DISTINCT c.id), 0) AS comment_count
  FROM posts p
  INNER JOIN users u ON u.id = p.user_id
  LEFT JOIN conversations t ON t.name = CONCAT('post-thread:', p.id)
  LEFT JOIN likes l ON l.post_id = p.id
  LEFT JOIN comments c ON c.post_id = p.id
`;

const postGroupBy = `
  GROUP BY
    p.id,
    p.user_id,
    p.content,
    p.type,
    p.created_at,
    t.id,
    u.name,
    u.profile_pic_url
`;

const mapPost = (post) => ({
  ...post,
  like_count: Number(post.like_count || 0),
  comment_count: Number(post.comment_count || 0),
  thread_id: post.thread_id ? Number(post.thread_id) : null,
  user: {
    id: post.user_id,
    name: post.user_name,
    profile_pic_url: post.profile_pic_url,
  },
});

const PostModel = {
  async create(payload) {
    const { user_id, content, type = 'general' } = payload;

    const result = await query(
      'INSERT INTO posts (user_id, content, type) VALUES (?, ?, ?)',
      [user_id, content, type]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(
      `${postBaseSelect} WHERE p.id = ? ${postGroupBy} LIMIT 1`,
      [id]
    );
    return rows[0] ? mapPost(rows[0]) : null;
  },

  async findAll() {
    const rows = await query(
      `${postBaseSelect} ${postGroupBy} ORDER BY p.id DESC`
    );
    return rows.map(mapPost);
  },

  async update(id, payload) {
    const fields = [];
    const values = [];

    ['content', 'type'].forEach((field) => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (fields.length) {
      await query(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingPost = await this.findById(id);

    if (!existingPost) {
      return null;
    }

    await query('DELETE FROM likes WHERE post_id = ?', [id]);
    await query('DELETE FROM comments WHERE post_id = ?', [id]);
    await query('DELETE FROM posts WHERE id = ?', [id]);
    return existingPost;
  },

  async addLike(postId, userId) {
    const result = await query(
      'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
      [postId, userId]
    );

    return result.insertId;
  },
};

export default PostModel;
