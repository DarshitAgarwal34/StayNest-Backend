import express from 'express';

import {
  createMessage,
  deleteMessage,
  getAllMessages,
  getMessagesWithUser,
  updateMessage,
} from '../controllers/message.controller.js';

import { verifyToken } from '../middlewares/auth.middleware.js';
import { validate } from '../validators/validate.middleware.js';
import {
  createMessageSchema,
  updateMessageSchema,
} from '../validators/message.validator.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllMessages);
router.get('/conversation/:conversationId', getMessagesWithUser);
router.post('/', validate(createMessageSchema), createMessage);
router.put('/:id', validate(updateMessageSchema), updateMessage);
router.delete('/:id', deleteMessage);

export default router;
