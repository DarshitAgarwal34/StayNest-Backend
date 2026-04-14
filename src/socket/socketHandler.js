import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

import MessageModel from '../models/message.model.js';
import ConversationMemberModel from '../models/conversationMember.model.js';
import NotificationModel from '../models/notification.model.js';

const connectedUsers = new Map();

const userRoom = (userId) => `user:${userId}`;

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
};

export const initializeSocket = (server, clientOrigin) => {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const userId = socket.user.user_id;

    connectedUsers.set(String(userId), socket.id);
    socket.join(userRoom(userId));

    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('newMessage', async (payload, callback) => {
      try {
        const { conversation_id, message } = payload || {};

        if (!conversation_id || !message) {
          throw new Error('conversation_id and message are required.');
        }

        const savedMessage = await MessageModel.create({
          conversation_id,
          sender_id: userId,
          message,
        });

        io.to(`conversation:${conversation_id}`).emit('newMessage', savedMessage);

        const members =
          await ConversationMemberModel.findUserIdsByConversationId(conversation_id);

        const recipients = members.filter(
          (memberId) => Number(memberId) !== Number(userId)
        );

        for (const recipientId of recipients) {
          const notification = await NotificationModel.create({
            user_id: recipientId,
            type: 'message',
            content: 'You have a new message.',
            is_read: 0,
          });

          io.to(userRoom(recipientId)).emit('notification', notification);
        }

        callback?.({ success: true, data: savedMessage });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on('notification', async (payload, callback) => {
      try {
        const notification = await NotificationModel.create({
          ...payload,
          is_read: payload?.is_read ?? 0,
        });

        io.to(userRoom(notification.user_id)).emit('notification', notification);

        callback?.({ success: true, data: notification });
      } catch (error) {
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on('newPost', (payload, callback) => {
      io.emit('newPost', payload);
      callback?.({ success: true });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(String(userId));
    });
  });

  return io;
};

export const emitNotificationToUser = (io, userId, notification) => {
  io.to(userRoom(userId)).emit('notification', notification);
};

export const emitPostEvent = (io, eventName, payload) => {
  io.emit(eventName, payload);
};

export default initializeSocket;
