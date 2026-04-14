import express from 'express';

import {
  createNotification,
  deleteNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
} from '../controllers/notification.controller.js';
import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get(
  '/',
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  getAllNotifications
);
router.get(
  '/:id',
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  getNotificationById
);
router.post(
  '/',
  roleBasedAccess('admin'),
  createNotification
);
router.put(
  '/:id',
  roleBasedAccess('admin'),
  updateNotification
);
router.delete(
  '/:id',
  roleBasedAccess('admin'),
  deleteNotification
);

export default router;
