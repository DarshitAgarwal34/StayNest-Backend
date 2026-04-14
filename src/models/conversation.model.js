import pool, { query } from '../db/connection.js';

const conversationSelect = `
  SELECT
    c.id,
    c.type,
    c.name,
    c.created_by,
    c.created_at,
    creator.name AS created_by_name
  FROM conversations c
  INNER JOIN users creator ON creator.id = c.created_by
`;

const ConversationModel = {
  async create(payload) {
    const { type = 'private', name = null, created_by, member_ids = [] } = payload;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO conversations (type, name, created_by) VALUES (?, ?, ?)',
        [type, name, created_by]
      );

      const conversationId = result.insertId;
      const members = Array.from(
        new Set([Number(created_by), ...member_ids.map((member) => Number(member)).filter(Boolean)])
      );

      for (const memberId of members) {
        await connection.execute(
          'INSERT IGNORE INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
          [conversationId, memberId]
        );
      }

      await connection.commit();
      return this.findById(conversationId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findById(id) {
    const rows = await query(`${conversationSelect} WHERE c.id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findAll() {
    return query(`${conversationSelect} ORDER BY c.created_at DESC, c.id DESC`);
  },

  async findAllForUser(userId) {
    return query(
      `${conversationSelect}
       INNER JOIN conversation_members cm ON cm.conversation_id = c.id
       WHERE cm.user_id = ?
       GROUP BY c.id, c.type, c.name, c.created_by, c.created_at, creator.name
       ORDER BY c.created_at DESC, c.id DESC`,
      [userId]
    );
  },

  async getMembers(conversationId) {
    const rows = await query(
      `SELECT
         cm.user_id,
         u.name,
         u.role,
         u.profile_pic_url
       FROM conversation_members cm
       INNER JOIN users u ON u.id = cm.user_id
       WHERE cm.conversation_id = ?
       ORDER BY cm.id ASC`,
      [conversationId]
    );

    return rows;
  },

  async findPrivateBetweenUsers(userA, userB) {
    const rows = await query(
      `
        SELECT c.*
        FROM conversations c
        INNER JOIN conversation_members cm1 ON cm1.conversation_id = c.id
        INNER JOIN conversation_members cm2 ON cm2.conversation_id = c.id
        WHERE c.type = 'private'
          AND cm1.user_id = ?
          AND cm2.user_id = ?
        LIMIT 1
      `,
      [userA, userB]
    );

    return rows[0] || null;
  },
};

export default ConversationModel;
