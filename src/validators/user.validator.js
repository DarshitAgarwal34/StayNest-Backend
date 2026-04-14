import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  role: z.enum(["student", "renter", "service_provider", "admin"]).optional(),
  profile_pic_url: z.string().url().optional(),
});