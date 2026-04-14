import { z } from 'zod';

export const createMessageSchema = z.object({
  conversation_id: z.coerce.number().int().positive(),
  message: z.string().min(1, 'Message cannot be empty'),
});

export const updateMessageSchema = z.object({
  message: z.string().min(1).optional(),
});
