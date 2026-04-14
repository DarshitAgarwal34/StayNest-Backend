import { query } from '../db/connection.js';

const PreferenceModel = {
  async create(payload) {
    const result = await query(
      `
        INSERT INTO preferences
          (user_id, budget, location, sharing_type, smoking, sleep_schedule, study_type, cleanliness)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.user_id,
        payload.budget,
        payload.location,
        payload.sharing_type,
        payload.smoking,
        payload.sleep_schedule,
        payload.study_type,
        payload.cleanliness,
      ]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(
      `
        SELECT
          p.*,
          u.name AS user_name,
          u.role AS user_role
        FROM preferences p
        INNER JOIN users u ON u.id = p.user_id
        WHERE p.id = ?
        LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByUserId(userId) {
    const rows = await query(
      `
        SELECT
          p.*,
          u.name AS user_name,
          u.role AS user_role
        FROM preferences p
        INNER JOIN users u ON u.id = p.user_id
        WHERE p.user_id = ?
        LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  },

  async findAll() {
    return query(
      `
        SELECT
          p.*,
          u.name AS user_name,
          u.role AS user_role
        FROM preferences p
        INNER JOIN users u ON u.id = p.user_id
        ORDER BY p.id DESC
      `
    );
  },

  async update(id, payload) {
    const fields = [];
    const values = [];

    [
      'budget',
      'location',
      'sharing_type',
      'smoking',
      'sleep_schedule',
      'study_type',
      'cleanliness',
    ].forEach((field) => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (fields.length) {
      await query(`UPDATE preferences SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingPreference = await this.findById(id);

    if (!existingPreference) {
      return null;
    }

    await query('DELETE FROM preferences WHERE id = ?', [id]);
    return existingPreference;
  },
};

export default PreferenceModel;
