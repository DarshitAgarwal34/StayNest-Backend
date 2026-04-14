import express from 'express';

import {
  createAmenity,
  deleteAmenity,
  getAllAmenities,
  getAmenityById,
  updateAmenity,
} from '../controllers/amenity.controller.js';
import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllAmenities);
router.get('/:id', getAmenityById);
router.post('/', verifyToken, roleBasedAccess('admin'), createAmenity);
router.put('/:id', verifyToken, roleBasedAccess('admin'), updateAmenity);
router.delete('/:id', verifyToken, roleBasedAccess('admin'), deleteAmenity);

export default router;
