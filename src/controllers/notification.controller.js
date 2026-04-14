import NotificationModel from '../models/notification.model.js';

export const createNotification = async (req, res, next) => {
  try {
    const notification = await NotificationModel.create(req.body);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = async (req, res, next) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await NotificationModel.findAll({
      userId: req.user.role === 'admin' ? undefined : req.user.user_id,
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const existingNotification = await NotificationModel.findById(req.params.id);

    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    const updatedNotification = await NotificationModel.update(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const deletedNotification = await NotificationModel.delete(req.params.id);

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
      data: deletedNotification,
    });
  } catch (error) {
    next(error);
  }
};
