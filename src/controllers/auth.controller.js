import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { query } from '../db/connection.js';
import UserModel from '../models/user.model.js';

const allowedRoles = ['student', 'renter', 'service_provider', 'admin'];
const formatRoleLabel = (role) => role.replaceAll('_', ' ');
const calculateAge = (dob) => {
  if (!dob) {
    return null;
  }

  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const generateToken = (user) =>
  jwt.sign(
    {
      user_id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );

export const signup = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      dob,
      age,
      gender,
      role,
      profile_pic_url,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided.',
      });
    }

    const existingUser = await UserModel.findByEmailAndRole(email, role);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const derivedAge = dob ? calculateAge(dob) : age || null;

    const user = await UserModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
      dob,
      age: derivedAge,
      gender,
      role,
      profile_pic_url,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required for login.',
      });
    }

    const user = await UserModel.findByEmailAndRole(email, role, {
      includePassword: true,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          dob: user.dob,
          age: user.age,
          gender: user.gender,
          role: user.role,
          profile_pic_url: user.profile_pic_url,
        },
        token,
      },
    });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, dob, role, new_password } = req.body;

    if (!email || !dob || !role || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Email, role, date of birth, and new password are required.',
      });
    }

    const rows = await query(
      `
        SELECT
          id,
          DATE_FORMAT(dob, '%Y-%m-%d') AS dob
        FROM users
        WHERE email = ? AND role = ?
        LIMIT 1
      `,
      [email, role]
    );

    const user = rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for the provided email and role.',
      });
    }

    if (String(user.dob) !== String(dob)) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth does not match the account.',
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    await UserModel.update(user.id, {
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};
