import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1, "Post content required"),
  type: z.enum(["general", "roommate", "service"]).optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(1).optional(),
  type: z.enum(["general", "roommate", "service"]).optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});