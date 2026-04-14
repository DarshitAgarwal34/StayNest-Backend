import express from 'express';

import {
  deleteAdminPost,
  deleteAdminProperty,
  deleteAdminService,
  deleteAdminUser,
  getAdminOverview,
  getAdminPosts,
  getAdminProperties,
  getAdminReports,
  getAdminServices,
  getAdminUsers,
  markReportRead,
} from '../controllers/admin.controller.js';
import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken, roleBasedAccess('admin'));

router.get('/overview', getAdminOverview);
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);
router.get('/properties', getAdminProperties);
router.delete('/properties/:id', deleteAdminProperty);
router.get('/posts', getAdminPosts);
router.delete('/posts/:id', deleteAdminPost);
router.get('/services', getAdminServices);
router.delete('/services/:id', deleteAdminService);
router.get('/reports', getAdminReports);
router.patch('/reports/:id/read', markReportRead);

export default router;
