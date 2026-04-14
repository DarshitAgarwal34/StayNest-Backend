import express from 'express';

import {
  createProperty,
  deleteProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
} from '../controllers/property.controller.js';

import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';
import { uploadMultipleImages } from '../middlewares/uploadMiddleware.js';

import { validate } from '../validators/validate.middleware.js';
import {
  createPropertySchema,
  updatePropertySchema,
} from '../validators/property.validator.js';

const router = express.Router();

router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

router.post(
  '/',
  verifyToken,
  roleBasedAccess('renter', 'admin'),
  uploadMultipleImages,
  validate(createPropertySchema),
  createProperty
);

router.put(
  '/:id',
  verifyToken,
  roleBasedAccess('renter', 'admin'),
  uploadMultipleImages,
  validate(updatePropertySchema),
  updateProperty
);

router.delete(
  '/:id',
  verifyToken,
  roleBasedAccess('renter', 'admin'),
  deleteProperty
);

export default router;