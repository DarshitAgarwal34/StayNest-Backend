import ServiceModel from '../models/service.model.js';
import NotificationModel from '../models/notification.model.js';
import UserModel from '../models/user.model.js';
import { uploadImage } from '../utils/cloudinary.js';
import { broadcastNotificationToAllUsers } from '../utils/notificationBroadcaster.js';
import { emitNotificationToUser } from '../socket/socketHandler.js';
import fs from 'fs/promises';

const removeLocalFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Failed to remove local upload:', error.message);
    }
  }
};

export const createService = async (req, res, next) => {
  try {
    const provider = await UserModel.findById(req.user.user_id);

    if (!provider || !['service_provider', 'admin'].includes(provider.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only service providers and admins can create services.',
      });
    }

    let imageUrl = null;

    if (req.file) {
      const uploaded = await uploadImage(req.file);
      imageUrl = uploaded.secure_url;
      await removeLocalFile(req.file.path);
    }

    const service = await ServiceModel.create({
      provider_id: req.user.user_id,
      title: req.body.title,
      description: req.body.description,
      image_url: imageUrl,
      price: req.body.price,
      location: req.body.location,
    });

    const io = req.app.get('io');
    if (io) {
      await broadcastNotificationToAllUsers(io, {
        type: 'service',
        content: `A new service was listed: ${service.title}.`,
        excludeUserId: req.user.user_id,
      });
    }

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllServices = async (req, res, next) => {
  try {
    const services = await ServiceModel.findAll();

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const existingService = await ServiceModel.findById(req.params.id);

    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    let imageUrl;

    if (req.file) {
      const uploaded = await uploadImage(req.file);
      imageUrl = uploaded.secure_url;
      await removeLocalFile(req.file.path);
    }

    const updatedService = await ServiceModel.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      image_url: imageUrl,
    });

    res.status(200).json({
      success: true,
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const deletedService = await ServiceModel.delete(req.params.id);

    if (!deletedService) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully.',
      data: deletedService,
    });
  } catch (error) {
    next(error);
  }
};

export const requestService = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    const requester = await UserModel.findById(req.user.user_id);

    if (!requester || requester.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can request services.',
      });
    }

    const providerNotification = await NotificationModel.create({
      user_id: service.provider_id,
      type: 'service_request',
      content: `${requester.name || 'A student'} requested your service: ${service.title}.`,
      is_read: 0,
    });

    const requesterNotification = await NotificationModel.create({
      user_id: requester.id,
      type: 'service_request_sent',
      content: `You requested the service: ${service.title}.`,
      is_read: 0,
    });

    const io = req.app.get('io');
    if (io) {
      emitNotificationToUser(io, service.provider_id, providerNotification);
      emitNotificationToUser(io, requester.id, requesterNotification);
    }

    res.status(200).json({
      success: true,
      message: 'Service request sent successfully.',
      data: {
        service,
        providerNotification,
        requesterNotification,
      },
    });
  } catch (error) {
    next(error);
  }
};
