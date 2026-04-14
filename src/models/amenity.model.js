import { query } from '../db/connection.js';

const AmenityModel = {
  async create(payload) {
    const { name } = payload;
    const result = await query(
      'INSERT INTO amenities (name) VALUES (?)',
      [name]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query('SELECT id, name FROM amenities WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findAll() {
    return query('SELECT id, name FROM amenities ORDER BY name ASC, id ASC');
  },

  async update(id, payload) {
    if (payload.name !== undefined) {
      await query('UPDATE amenities SET name = ? WHERE id = ?', [payload.name, id]);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingAmenity = await this.findById(id);

    if (!existingAmenity) {
      return null;
    }

    await query('DELETE FROM amenities WHERE id = ?', [id]);
    return existingAmenity;
  },
};

export default AmenityModel;
