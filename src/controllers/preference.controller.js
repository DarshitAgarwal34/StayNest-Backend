import PreferenceModel from '../models/preference.model.js';
import UserModel from '../models/user.model.js';

const ensureStudent = async (userId) => {
  const user = await UserModel.findById(userId);
  return user?.role === 'student' ? user : null;
};

export const getMyPreference = async (req, res, next) => {
  try {
    const preference = await PreferenceModel.findByUserId(req.user.user_id);

    res.status(200).json({
      success: true,
      data: preference,
    });
  } catch (error) {
    next(error);
  }
};

export const createPreference = async (req, res, next) => {
  try {
    const student = await ensureStudent(req.user.user_id);

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only students can create preferences.',
      });
    }

    const existingPreference = await PreferenceModel.findByUserId(req.user.user_id);

    if (existingPreference) {
      return res.status(409).json({
        success: false,
        message: 'Preference already exists for this user.',
      });
    }

    const preference = await PreferenceModel.create({
      user_id: req.user.user_id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: preference,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyPreference = async (req, res, next) => {
  try {
    const student = await ensureStudent(req.user.user_id);

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Only students can update preferences.',
      });
    }

    const preference = await PreferenceModel.findByUserId(req.user.user_id);

    if (!preference) {
      return res.status(404).json({
        success: false,
        message: 'Preference not found.',
      });
    }

    const updatedPreference = await PreferenceModel.update(preference.id, req.body);

    res.status(200).json({
      success: true,
      data: updatedPreference,
    });
  } catch (error) {
    next(error);
  }
};
