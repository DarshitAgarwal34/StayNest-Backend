import { query } from '../db/connection.js';

const messageSelect = `
  SELECT
    m.id,
    m.conversation_id,
    m.sender_id,
    m.message,
    m.created_at,
    sender.name AS sender_name,
    sender.profile_pic_url AS sender_profile_pic_url
  FROM messages m
  INNER JOIN users sender ON sender.id = m.sender_id
`;

const mapMessage = (message) => ({
  ...message,
  sender: {
    id: message.sender_id,
    name: message.sender_name,
    profile_pic_url: message.sender_profile_pic_url,
  },
});

const MessageModel = {
  async create(payload) {
    const { conversation_id, sender_id, message } = payload;

    const result = await query(
      'INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)',
      [conversation_id, sender_id, message]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`${messageSelect} WHERE m.id = ? LIMIT 1`, [id]);
    return rows[0] ? mapMessage(rows[0]) : null;
  },

  async findAll() {
    const rows = await query(
      `${messageSelect} ORDER BY m.created_at ASC, m.id ASC`
    );
    return rows.map(mapMessage);
  },

  async findForUser(userId) {
    const rows = await query(
      `SELECT DISTINCT
         m.id,
         m.conversation_id,
         m.sender_id,
         m.message,
         m.created_at,
         sender.name AS sender_name,
         sender.profile_pic_url AS sender_profile_pic_url
       FROM messages m
       INNER JOIN users sender ON sender.id = m.sender_id
       INNER JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
       WHERE cm.user_id = ?
       ORDER BY m.created_at ASC, m.id ASC`,
      [userId]
    );

    return rows.map(mapMessage);
  },

  async findByConversationId(conversationId) {
    const rows = await query(
      `${messageSelect} WHERE m.conversation_id = ? ORDER BY m.created_at ASC, m.id ASC`,
      [conversationId]
    );
    return rows.map(mapMessage);
  },

  async update(id, payload) {
    const fields = [];
    const values = [];

    ['conversation_id', 'sender_id', 'message'].forEach((field) => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (fields.length) {
      await query(`UPDATE messages SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingMessage = await this.findById(id);

    if (!existingMessage) {
      return null;
    }

    await query('DELETE FROM messages WHERE id = ?', [id]);
    return existingMessage;
  },
};

export default MessageModel;
