import { z } from 'zod';

const parseAmenityIds = (value) => {
  if (value == null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(Number).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Boolean);
    }
  }

  return undefined;
};

export const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  location: z.string().min(2),
  rent: z.coerce.number().positive(),
  max_sharing: z.coerce.number().int().positive().optional(),
  amenity_ids: z.preprocess(
    parseAmenityIds,
    z.array(z.coerce.number()).optional()
  ),
});

export const updatePropertySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  rent: z.coerce.number().positive().optional(),
  max_sharing: z.coerce.number().int().positive().optional(),
  amenity_ids: z.preprocess(
    parseAmenityIds,
    z.array(z.coerce.number()).optional()
  ),
});
