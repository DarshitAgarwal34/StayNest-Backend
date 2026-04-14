import { query } from '../db/connection.js';

const ConversationMemberModel = {
  async findUserIdsByConversationId(conversationId) {
    const rows = await query(
      'SELECT user_id FROM conversation_members WHERE conversation_id = ? ORDER BY id ASC',
      [conversationId]
    );

    return rows.map((row) => Number(row.user_id));
  },

  async addMember(conversationId, userId) {
    const result = await query(
      'INSERT IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
      [conversationId, userId]
    );

    return {
      id: result.insertId,
      conversation_id: conversationId,
      user_id: userId,
    };
  },
};

export default ConversationMemberModel;
