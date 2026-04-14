import AmenityModel from '../models/amenity.model.js';

export const createAmenity = async (req, res, next) => {
  try {
    const amenity = await AmenityModel.create(req.body);

    res.status(201).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
};

export const getAmenityById = async (req, res, next) => {
  try {
    const amenity = await AmenityModel.findById(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: 'Amenity not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAmenities = async (req, res, next) => {
  try {
    const amenities = await AmenityModel.findAll();

    res.status(200).json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAmenity = async (req, res, next) => {
  try {
    const amenity = await AmenityModel.update(req.params.id, req.body);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: 'Amenity not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAmenity = async (req, res, next) => {
  try {
    const amenity = await AmenityModel.delete(req.params.id);

    if (!amenity) {
      return res.status(404).json({
        success: false,
        message: 'Amenity not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
};
