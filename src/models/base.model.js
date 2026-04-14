import { query } from '../db/connection.js';

const ensurePayload = (payload, action) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`A valid payload object is required to ${action}.`);
  }

  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    throw new Error(`At least one field is required to ${action}.`);
  }

  return entries;
};

export const createCrudModel = (tableName) => ({
  async create(payload) {
    const entries = ensurePayload(payload, 'create a record');
    const columns = entries.map(([key]) => key).join(', ');
    const placeholders = entries.map(() => '?').join(', ');
    const values = entries.map(([, value]) => value);

    const result = await query(
      `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`,
      values
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findAll() {
    return query(`SELECT * FROM ${tableName} ORDER BY id DESC`);
  },

  async update(id, payload) {
    const entries = ensurePayload(payload, 'update a record');
    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    await query(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async delete(id) {
    const existingRecord = await this.findById(id);

    if (!existingRecord) {
      return null;
    }

    await query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
    return existingRecord;
  },
});
