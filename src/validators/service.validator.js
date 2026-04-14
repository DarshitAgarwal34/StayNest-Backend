import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  location: z.string().min(2),
});

export const updateServiceSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.coerce.number().positive().optional(),
  location: z.string().optional(),
});
