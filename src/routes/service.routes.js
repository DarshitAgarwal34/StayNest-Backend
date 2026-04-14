import express from 'express';

import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  requestService,
  updateService,
} from '../controllers/service.controller.js';

import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';
import { uploadSingleImage } from '../middlewares/uploadMiddleware.js';

import { validate } from '../validators/validate.middleware.js';
import {
  createServiceSchema,
  updateServiceSchema,
} from '../validators/service.validator.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/:id', getServiceById);
router.post('/:id/request', verifyToken, roleBasedAccess('student'), requestService);

router.post(
  '/',
  verifyToken,
  roleBasedAccess('service_provider', 'admin'),
  uploadSingleImage,
  validate(createServiceSchema),
  createService
);

router.put(
  '/:id',
  verifyToken,
  roleBasedAccess('service_provider', 'admin'),
  uploadSingleImage,
  validate(updateServiceSchema),
  updateService
);

router.delete(
  '/:id',
  verifyToken,
  roleBasedAccess('service_provider', 'admin'),
  deleteService
);

export default router;
