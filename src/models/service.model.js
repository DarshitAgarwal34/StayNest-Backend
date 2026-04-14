import { query } from '../db/connection.js';

const serviceSelect = `
  SELECT
    s.id,
    s.provider_id,
    s.title,
    s.description,
    s.price,
    s.location,
    s.created_at,
    u.name AS provider_name,
    u.email AS provider_email
  FROM services s
  INNER JOIN users u ON u.id = s.provider_id
`;

const parseDescriptionPayload = (description) => {
  if (description == null) {
    return {
      description: null,
      image_url: null,
    };
  }

  if (typeof description !== 'string') {
    return {
      description: String(description),
      image_url: null,
    };
  }

  try {
    const parsed = JSON.parse(description);

    if (parsed && typeof parsed === 'object') {
      return {
        description: parsed.text ?? '',
        image_url: parsed.image_url ?? null,
      };
    }
  } catch {
    // fall through to plain text
  }

  return {
    description,
    image_url: null,
  };
};

const buildStoredDescription = ({ description, image_url }) => {
  if (!image_url) {
    return description ?? null;
  }

  return JSON.stringify({
    text: description ?? '',
    image_url,
  });
};

const hydrateService = (row) => {
  if (!row) {
    return null;
  }

  const parsed = parseDescriptionPayload(row.description);

  return {
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    description: parsed.description,
    image_url: parsed.image_url,
    price: row.price,
    location: row.location,
    created_at: row.created_at,
    provider: {
      id: row.provider_id,
      name: row.provider_name,
      email: row.provider_email,
    },
  };
};

const ServiceModel = {
  async create(payload) {
    const { provider_id, title, description = null, image_url = null, price, location } = payload;

    const result = await query(
      `
        INSERT INTO services
          (provider_id, title, description, price, location)
        VALUES (?, ?, ?, ?, ?)
      `,
      [provider_id, title, buildStoredDescription({ description, image_url }), price, location]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`${serviceSelect} WHERE s.id = ? LIMIT 1`, [id]);
    return hydrateService(rows[0] || null);
  },

  async findAll() {
    const rows = await query(`${serviceSelect} ORDER BY s.id DESC`);
    return rows.map(hydrateService).filter(Boolean);
  },

  async update(id, payload) {
    const fields = [];
    const values = [];

    ['title', 'price', 'location'].forEach((field) => {
      if (payload[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(payload[field]);
      }
    });

    if (payload.description !== undefined || payload.image_url !== undefined) {
      const current = await this.findById(id);
      fields.push('description = ?');
      values.push(
        buildStoredDescription({
          description: payload.description !== undefined ? payload.description : current?.description,
          image_url: payload.image_url !== undefined ? payload.image_url : current?.image_url,
        })
      );
    }

    if (fields.length) {
      await query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, [
        ...values,
        id,
      ]);
    }

    return this.findById(id);
  },

  async delete(id) {
    const existingService = await this.findById(id);

    if (!existingService) {
      return null;
    }

    await query('DELETE FROM services WHERE id = ?', [id]);
    return existingService;
  },
};

export default ServiceModel;
