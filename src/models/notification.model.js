import { query } from '../db/connection.js';

const notificationSelect = `
  SELECT
    n.id,
    n.user_id,
    n.type,
    n.content,
    n.is_read,
    n.created_at,
    u.name AS user_name
  FROM notifications n
  INNER JOIN users u ON u.id = n.user_id
`;

const NotificationModel = {
  async create(payload) {
    const {
      user_id,
      type,
      content,
      is_read = 0,
    } = payload;

    const result = await query(
      'INSERT INTO notifications (user_id, type, content, is_read) VALUES (?, ?, ?, ?)',
      [user_id, type, content, is_read]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`${notificationSelect} WHERE n.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findAll({ userId } = {}) {
    if (userId) {
      return query(
        `${notificationSelect} WHERE n.user_id = ? ORDER BY n.created_at DESC, n.id DESC`,
        [userId]
      );
    }

    return query(`${notificationSelect} ORDER BY n.created_at DESC, n.id DESC`);
  },

  async update(id, payload) {
    const fields = [];
    const values = [];

    ['type', 'content', 'is_read'].forEach((field) => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (fields.length) {
      await query(`UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingNotification = await this.findById(id);

    if (!existingNotification) {
      return null;
    }

    await query('DELETE FROM notifications WHERE id = ?', [id]);
    return existingNotification;
  },
};

export default NotificationModel;
