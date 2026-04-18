import { z } from "zod";

export type EditUserInfoSchema = z.infer<typeof editUserInfoSchema>;

export const editUserInfoSchema = z.object({
  fullname: z.string().trim().optional(),
  dateOfBirth: z.date().optional(),
  info: z.string().trim().optional(),
});