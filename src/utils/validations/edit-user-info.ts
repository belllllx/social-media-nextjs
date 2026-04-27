import { z } from "zod";

export type EditUserInfoSchema = z.infer<typeof editUserInfoSchema>;

export const editUserInfoSchema = z.object({
  fullname: z.string().trim().max(30, "Fullname must be less than or equal to 30 length").optional(),
  dateOfBirth: z.string().optional(),
  info: z.string().trim().max(30, "Info must be less than or equal to 30 length").optional(),
});