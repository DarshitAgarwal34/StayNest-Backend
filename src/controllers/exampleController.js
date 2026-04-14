import { query } from '../db/connection.js';

export const getDatabaseStatus = async (req, res, next) => {
  try {
    const rows = await query(
      'SELECT DATABASE() AS databaseName, NOW() AS serverTime'
    );

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    error.statusCode = 500;
    error.message = 'Unable to fetch database status';
    next(error);
  }
};
