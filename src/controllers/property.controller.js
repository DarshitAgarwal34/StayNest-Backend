import fs from 'fs/promises';

import UserModel from '../models/user.model.js';
import { uploadImage } from '../utils/cloudinary.js';
import PropertyModel from '../models/property.model.js';
import { broadcastNotificationToAllUsers } from '../utils/notificationBroadcaster.js';

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

const uploadPropertyImages = async (files = [], propertyId) => {
  const uploadedImageUrls = [];

  for (const file of files) {
    try {
      const image = await uploadImage(file);
      uploadedImageUrls.push(image.secure_url);
    } finally {
      await removeLocalFile(file.path);
    }
  }

  return uploadedImageUrls;
};

const parseAmenityIds = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(Number).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
    } catch {
      return value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Boolean);
    }
  }

  return [];
};

export const createProperty = async (req, res, next) => {
  try {
    const owner = await UserModel.findById(req.user.user_id);

    if (!owner || owner.role !== 'renter') {
      return res.status(403).json({
        success: false,
        message: 'Only renters can create properties.',
      });
    }

    const imageUrls = await uploadPropertyImages(req.files || []);
    const amenityIds = parseAmenityIds(req.body.amenity_ids);

    const property = await PropertyModel.create({
      owner_id: req.user.user_id,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      rent: req.body.rent,
      max_sharing: req.body.max_sharing,
      imageUrls,
      amenityIds,
    });

    const io = req.app.get('io');
    if (io) {
      await broadcastNotificationToAllUsers(io, {
        type: 'property',
        content: `A new property was listed: ${property.title}.`,
        excludeUserId: req.user.user_id,
      });
    }

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const property = await PropertyModel.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProperties = async (req, res, next) => {
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

export const updateProperty = async (req, res, next) => {
  try {
    const existingProperty = await PropertyModel.findById(req.params.id);

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found.',
      });
    }

    const imageUrls = await uploadPropertyImages(req.files || []);
    const amenityIds =
      req.body.amenity_ids !== undefined
        ? parseAmenityIds(req.body.amenity_ids)
        : undefined;

    const updatedProperty = await PropertyModel.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
      rent: req.body.rent,
      max_sharing: req.body.max_sharing,
      imageUrls,
      amenityIds,
    });

    const io = req.app.get('io');
    if (io && imageUrls.length) {
      await broadcastNotificationToAllUsers(io, {
        type: 'property',
        content: `A property was updated: ${updatedProperty.title}.`,
        excludeUserId: req.user.user_id,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
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
