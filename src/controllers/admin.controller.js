import UserModel from '../models/user.model.js';
import PropertyModel from '../models/property.model.js';
import PostModel from '../models/post.model.js';
import ServiceModel from '../models/service.model.js';
import NotificationModel from '../models/notification.model.js';
import { query } from '../db/connection.js';

const countSingle = async (sql, params = []) => {
  const rows = await query(sql, params);
  return Number(rows[0]?.count || 0);
};

export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      students,
      renters,
      serviceProviders,
      admins,
      totalProperties,
      totalServices,
      totalPosts,
      totalComments,
      unreadNotifications,
    ] = await Promise.all([
      countSingle('SELECT COUNT(*) AS count FROM users'),
      countSingle("SELECT COUNT(*) AS count FROM users WHERE role = 'student'"),
      countSingle("SELECT COUNT(*) AS count FROM users WHERE role = 'renter'"),
      countSingle("SELECT COUNT(*) AS count FROM users WHERE role = 'service_provider'"),
      countSingle("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'"),
      countSingle('SELECT COUNT(*) AS count FROM properties'),
      countSingle('SELECT COUNT(*) AS count FROM services'),
      countSingle('SELECT COUNT(*) AS count FROM posts'),
      countSingle('SELECT COUNT(*) AS count FROM comments'),
      countSingle('SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0'),
    ]);

    const users = await UserModel.findAll();

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          students,
          renters,
          serviceProviders,
          admins,
          totalProperties,
          totalServices,
          totalListings: totalProperties + totalServices,
          totalPosts,
          totalComments,
          unreadNotifications,
        },
        usersByRole: {
          student: users.filter((user) => user.role === 'student'),
          renter: users.filter((user) => user.role === 'renter'),
          service_provider: users.filter((user) => user.role === 'service_provider'),
          admin: users.filter((user) => user.role === 'admin'),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const users = await UserModel.findAll();

    const filteredUsers = role ? users.filter((user) => user.role === role) : users;

    res.status(200).json({
      success: true,
      data: filteredUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'admin' && Number(user.id) === Number(req.user.user_id)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const deletedUser = await UserModel.delete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
      data: deletedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProperties = async (req, res, next) => {
  try {
    const properties = await PropertyModel.findAll();

    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminProperty = async (req, res, next) => {
  try {
    const deletedProperty = await PropertyModel.delete(req.params.id);

    if (!deletedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully.',
      data: deletedProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminPosts = async (req, res, next) => {
  try {
    const posts = await PostModel.findAll();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminPost = async (req, res, next) => {
  try {
    const deletedPost = await PostModel.delete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
      data: deletedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminServices = async (req, res, next) => {
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

export const deleteAdminService = async (req, res, next) => {
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

export const getAdminReports = async (req, res, next) => {
  try {
    const notifications = await NotificationModel.findAll();
    const reports = notifications.filter((notification) =>
      ['report', 'complaint', 'post_interaction', 'message', 'property', 'service'].includes(
        notification.type
      )
    );

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

export const markReportRead = async (req, res, next) => {
  try {
    const notification = await NotificationModel.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    const updated = await NotificationModel.update(req.params.id, {
      is_read: 1,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
