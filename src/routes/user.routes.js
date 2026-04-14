import express from 'express';

import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/user.controller.js';

import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';

import { validate } from '../validators/validate.middleware.js';
import { updateUserSchema } from '../validators/user.validator.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', roleBasedAccess('admin'), getAllUsers);

router.get('/:id', getUserById);

router.post('/', roleBasedAccess('admin'), createUser);

router.put(
  '/:id',
  validate(updateUserSchema),
  (req, res, next) => {
    if (
      req.user.user_id !== Number(req.params.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this user',
      });
    }
    next();
  },
  updateUser
);

router.delete('/:id', roleBasedAccess('admin'), deleteUser);

export default router;