import { z } from "zod";

export const preferenceSchema = z.object({
  budget: z.number().positive(),
  location: z.string(),
  sharing_type: z.enum(["single", "double", "triple"]),
  smoking: z.boolean(),
  sleep_schedule: z.enum(["early", "late"]),
  study_type: z.enum(["quiet", "group"]),
  cleanliness: z.enum(["low", "medium", "high"]),
});