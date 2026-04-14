import express from 'express';

import {
  createConversation,
  getConversationById,
  getMyConversations,
  joinConversation,
} from '../controllers/conversation.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getMyConversations);
router.get('/:id', getConversationById);
router.post('/', createConversation);
router.post('/:id/join', joinConversation);

export default router;
