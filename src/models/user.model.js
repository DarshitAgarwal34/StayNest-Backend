import { query } from '../db/connection.js';

const baseUserSelect = `
  SELECT
    id,
    name,
    email,
    phone,
    dob,
    age,
    gender,
    role,
    profile_pic_url,
    created_at
  FROM users
`;

const userSelectWithPassword = `
  SELECT
    id,
    name,
    email,
    phone,
    dob,
    age,
    gender,
    role,
    profile_pic_url,
    created_at,
    password
  FROM users
`;

const mapUpdatableFields = (payload = {}) => {
  const allowedFields = [
    'name',
    'email',
    'phone',
    'password',
    'dob',
    'age',
    'gender',
    'role',
    'profile_pic_url',
  ];

  return Object.entries(payload).filter(
    ([key, value]) => allowedFields.includes(key) && value !== undefined
  );
};

const UserModel = {
  async create(payload) {
    const {
      name,
      email,
      phone = null,
      password,
      dob = null,
      age = null,
      gender = null,
      role,
      profile_pic_url = null,
    } = payload;

    const result = await query(
      `
        INSERT INTO users
          (name, email, phone, password, dob, age, gender, role, profile_pic_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [name, email, phone, password, dob, age, gender, role, profile_pic_url]
    );

    return this.findById(result.insertId);
  },

  async findById(id) {
    const rows = await query(`${baseUserSelect} WHERE id = ? LIMIT 1`, [id]);
    return rows[0] || null;
  },

  async findByEmail(email, { includePassword = false } = {}) {
    const columns = includePassword ? userSelectWithPassword : baseUserSelect;
    const rows = await query(`${columns} WHERE email = ? LIMIT 1`, [email]);
    return rows[0] || null;
  },

  async findByEmailAndRole(
    email,
    role,
    { includePassword = false } = {}
  ) {
    const columns = includePassword ? userSelectWithPassword : baseUserSelect;
    const rows = await query(
      `${columns} WHERE email = ? AND role = ? LIMIT 1`,
      [email, role]
    );
    return rows[0] || null;
  },

  async findAll() {
    return query(`${baseUserSelect} ORDER BY id DESC`);
  },

  async update(id, payload) {
    const entries = mapUpdatableFields(payload);

    if (!entries.length) {
      return this.findById(id);
    }

    const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    await query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  },

  async delete(id) {
    const existingUser = await this.findById(id);

    if (!existingUser) {
      return null;
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    return existingUser;
  },
};

export default UserModel;
