import bcrypt from 'bcryptjs';

import UserModel from '../models/user.model.js';

const sanitizeUser = (user) => {
  if (!user) return user;
  const { password, ...safeUser } = user;
  return safeUser;
};
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

export const createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 12);
    }

    if (payload.dob) {
      payload.age = calculateAge(payload.dob);
    }

    const user = await UserModel.create(payload);

    res.status(201).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();

    res.status(200).json({
      success: true,
      data: users.map(sanitizeUser),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const existingUser = await UserModel.findById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const payload = { ...req.body };

    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 12);
    }

    if (payload.dob) {
      payload.age = calculateAge(payload.dob);
    }

    const updatedUser = await UserModel.update(req.params.id, payload);

    res.status(200).json({
      success: true,
      data: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await UserModel.delete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: sanitizeUser(deletedUser),
    });
  } catch (error) {
    next(error);
  }
};
