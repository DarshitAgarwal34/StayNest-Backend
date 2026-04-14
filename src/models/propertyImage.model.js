import { query } from '../db/connection.js';

const PropertyImageModel = {
  async create(payload) {
    const result = await query(
      'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
      [payload.property_id, payload.image_url]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(
      'SELECT id, property_id, image_url FROM property_images WHERE id = ? LIMIT 1',
      [id]
    );

    return rows[0] || null;
  },

  async findAll() {
    return query(
      'SELECT id, property_id, image_url FROM property_images ORDER BY id DESC'
    );
  },

  async update(id, payload) {
    await query('UPDATE property_images SET image_url = ? WHERE id = ?', [
      payload.image_url,
      id,
    ]);

    return this.findById(id);
  },

  async delete(id) {
    const existingImage = await this.findById(id);

    if (!existingImage) {
      return null;
    }

    await query('DELETE FROM property_images WHERE id = ?', [id]);
    return existingImage;
  },
};

export default PropertyImageModel;
