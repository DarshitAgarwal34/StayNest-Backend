import NotificationModel from '../models/notification.model.js';
import UserModel from '../models/user.model.js';
import { emitNotificationToUser } from '../socket/socketHandler.js';

export const broadcastNotificationToAllUsers = async (
  io,
  { type, content, excludeUserId = null }
) => {
  const users = await UserModel.findAll();

  const recipients = users.filter(
    (user) => Number(user.id) !== Number(excludeUserId)
  );

  const notifications = [];

  for (const user of recipients) {
    const notification = await NotificationModel.create({
      user_id: user.id,
      type,
      content,
      is_read: 0,
    });

    notifications.push(notification);

    if (io) {
      emitNotificationToUser(io, user.id, notification);
    }
  }

  return notifications;
};
