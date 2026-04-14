import { query } from '../db/connection.js';

const propertyBaseSelect = `
  SELECT
    p.id,
    p.owner_id,
    p.title,
    p.description,
    p.location,
    p.rent,
    p.max_sharing,
    p.created_at,
    u.name AS owner_name,
    u.email AS owner_email,
    pi.id AS image_id,
    pi.image_url,
    a.id AS amenity_id,
    a.name AS amenity_name
  FROM properties p
  INNER JOIN users u ON u.id = p.owner_id
  LEFT JOIN property_images pi ON pi.property_id = p.id
  LEFT JOIN property_amenities pa ON pa.property_id = p.id
  LEFT JOIN amenities a ON a.id = pa.amenity_id
`;

const hydrateProperties = (rows) => {
  const properties = new Map();

  rows.forEach((row) => {
    if (!properties.has(row.id)) {
      properties.set(row.id, {
        id: row.id,
        owner_id: row.owner_id,
        title: row.title,
        description: row.description,
        location: row.location,
        rent: row.rent,
        max_sharing: row.max_sharing,
        created_at: row.created_at,
        owner: {
          id: row.owner_id,
          name: row.owner_name,
          email: row.owner_email,
        },
        images: [],
        amenities: [],
      });
    }

    const property = properties.get(row.id);

    if (
      row.image_id &&
      !property.images.some((image) => image.id === row.image_id)
    ) {
      property.images.push({
        id: row.image_id,
        image_url: row.image_url,
      });
    }

    if (
      row.amenity_id &&
      !property.amenities.some((amenity) => amenity.id === row.amenity_id)
    ) {
      property.amenities.push({
        id: row.amenity_id,
        name: row.amenity_name,
      });
    }
  });

  return Array.from(properties.values());
};

const getAmenitiesByIds = async (amenityIds = []) => {
  if (!amenityIds.length) {
    return [];
  }

  const placeholders = amenityIds.map(() => '?').join(', ');
  return query(
    `SELECT id, name FROM amenities WHERE id IN (${placeholders}) ORDER BY name ASC`,
    amenityIds
  );
};

const insertImages = async (propertyId, imageUrls = []) => {
  for (const imageUrl of imageUrls) {
    await query(
      'INSERT INTO property_images (property_id, image_url) VALUES (?, ?)',
      [propertyId, imageUrl]
    );
  }
};

const replaceAmenities = async (propertyId, amenityIds = []) => {
  await query('DELETE FROM property_amenities WHERE property_id = ?', [propertyId]);

  for (const amenityId of amenityIds) {
    await query(
      'INSERT INTO property_amenities (property_id, amenity_id) VALUES (?, ?)',
      [propertyId, amenityId]
    );
  }
};

const PropertyModel = {
  async create(payload) {
    const {
      owner_id,
      title,
      description = null,
      location,
      rent,
      max_sharing = 1,
      imageUrls = [],
      amenityIds = [],
    } = payload;

    const result = await query(
      `
        INSERT INTO properties
          (owner_id, title, description, location, rent, max_sharing)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [owner_id, title, description, location, rent, max_sharing]
    );

    await insertImages(result.insertId, imageUrls);
    await replaceAmenities(result.insertId, amenityIds);

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(
      `${propertyBaseSelect} WHERE p.id = ? ORDER BY p.id DESC, pi.id ASC, a.name ASC`,
      [id]
    );

    return hydrateProperties(rows)[0] || null;
  },

  async findAll() {
    const rows = await query(
      `${propertyBaseSelect} ORDER BY p.id DESC, pi.id ASC, a.name ASC`
    );
    return hydrateProperties(rows);
  },

  async update(id, payload) {
    const fields = [];
    const values = [];

    ['title', 'description', 'location', 'rent', 'max_sharing'].forEach((field) => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (fields.length) {
      await query(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    if (Array.isArray(payload.imageUrls) && payload.imageUrls.length) {
      await insertImages(id, payload.imageUrls);
    }

    if (Array.isArray(payload.amenityIds)) {
      await replaceAmenities(id, payload.amenityIds);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingProperty = await this.findById(id);

    if (!existingProperty) {
      return null;
    }

    await query('DELETE FROM property_amenities WHERE property_id = ?', [id]);
    await query('DELETE FROM property_images WHERE property_id = ?', [id]);
    await query('DELETE FROM properties WHERE id = ?', [id]);

    return existingProperty;
  },

  async getAmenitiesByIds(amenityIds) {
    return getAmenitiesByIds(amenityIds);
  },
};

export default PropertyModel;
