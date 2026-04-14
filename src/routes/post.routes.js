import express from 'express';

import {
  createComment,
  createPost,
  deletePost,
  getAllPosts,
  getPostComments,
  getPostById,
  likePost,
  updatePost,
} from '../controllers/post.controller.js';

import { roleBasedAccess, verifyToken } from '../middlewares/auth.middleware.js';

import { validate } from '../validators/validate.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  createCommentSchema,
} from '../validators/post.validator.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);

router.post(
  '/',
  verifyToken,
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  validate(createPostSchema),
  createPost
);

router.post(
  '/:id/like',
  verifyToken,
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  likePost
);

router.get('/:id/comments', getPostComments);

router.post(
  '/:id/comments',
  verifyToken,
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  validate(createCommentSchema),
  createComment
);

router.put(
  '/:id',
  verifyToken,
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  validate(updatePostSchema),
  updatePost
);

router.delete(
  '/:id',
  verifyToken,
  roleBasedAccess('student', 'renter', 'service_provider', 'admin'),
  deletePost
);

export default router;