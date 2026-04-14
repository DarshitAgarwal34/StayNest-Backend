import express from 'express';

import {
  createPreference,
  getMyPreference,
  updateMyPreference,
} from '../controllers/preference.controller.js';

import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';

import { validate } from '../validators/validate.middleware.js';
import { preferenceSchema } from '../validators/preference.validator.js';

const router = express.Router();

router.use(verifyToken);

router.get('/me', roleBasedAccess('student'), getMyPreference);

router.post(
  '/',
  roleBasedAccess('student'),
  validate(preferenceSchema),
  createPreference
);

router.put(
  '/me',
  roleBasedAccess('student'),
  validate(preferenceSchema),
  updateMyPreference
);

export default router;