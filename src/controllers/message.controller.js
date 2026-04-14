import MessageModel from '../models/message.model.js';
import ConversationMemberModel from '../models/conversationMember.model.js';
import NotificationModel from '../models/notification.model.js';
import { emitNotificationToUser } from '../socket/socketHandler.js';

export const createMessage = async (req, res, next) => {
  try {
    const { conversation_id, message } = req.body;

    if (!conversation_id || !message) {
      return res.status(400).json({
        success: false,
        message: 'conversation_id and message are required.',
      });
    }

    const conversationMembers =
      await ConversationMemberModel.findUserIdsByConversationId(conversation_id);

    if (
      !conversationMembers.some(
        (memberId) => Number(memberId) === Number(req.user.user_id)
      )
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this conversation.',
      });
    }

    const savedMessage = await MessageModel.create({
      conversation_id,
      sender_id: req.user.user_id,
      message,
    });

    const io = req.app.get('io');

    if (io) {
      io.to(`conversation:${conversation_id}`).emit('newMessage', savedMessage);
    }

    const recipientIds = conversationMembers.filter(
      (memberId) => Number(memberId) !== Number(req.user.user_id)
    );

    for (const recipientId of recipientIds) {
      const notification = await NotificationModel.create({
        user_id: recipientId,
        type: 'message',
        content: 'You have a new message.',
        is_read: 0,
      });

      if (io) {
        emitNotificationToUser(io, recipientId, notification);
      }
    }

    res.status(201).json({
      success: true,
      data: savedMessage,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMessages = async (req, res, next) => {
  try {
    const messages = await MessageModel.findForUser(req.user.user_id);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessagesWithUser = async (req, res, next) => {
  try {
    const conversationId = Number(req.params.conversationId);

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'A valid conversationId is required.',
      });
    }

    const messages = await MessageModel.findByConversationId(conversationId);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {
  try {
    const deleted = await MessageModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    res.json({
      success: true,
      message: 'Message deleted',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const updated = await MessageModel.update(req.params.id, {
      conversation_id: req.body.conversation_id,
      message: req.body.message,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
