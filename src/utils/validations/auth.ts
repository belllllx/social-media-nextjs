import { z } from "zod";

export type RegisterSchema = z.infer<typeof registerSchema>;

export type LoginSchema = z.infer<typeof loginSchema>;

export type AuthSchema = z.infer<typeof authSchema>;

export type OtpSchema = z.infer<typeof otpSchema>;

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z.object({
  fullname: z.string().trim().min(1, "Fullname is required").max(30, "Fullname must be less than or equal to 30 length"),
  username: z.string().trim().min(1, "Username is required").max(15, "Username must be less than or equal to 15 length"),
  email: z.email("Invalid email address").trim().max(30, "Email must be less than or equal to 30 length"),
  password: z
    .string()
    .trim()
    .min(6, "Password must be at least 6 characters long")
    .max(20, "Password must be at most 20 characters long"),
}); 

export const loginSchema = registerSchema
  .omit({
    fullname: true,
    email: true,
    password: true,
  })
  .extend({
    password: z.string().trim().min(1, "Password is required"),
  });

export const authSchema = z.object({
  email: z.email("Invalid email address").trim().max(30, "Email must be less than or equal to 30 length"),
});

export const otpSchema = z.object({
  otp: z
    .array(z.string().min(1), { message: "Pin is required" })
    .length(6, { message: "Otp must be 6 digits long" }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters long")
      .max(20, "Password must be at most 20 characters long"),
    confirmPassword: z
      .string()
      .trim()
      .min(6, "Confirm password must be at least 6 characters long")
      .max(20, "Confirm password must be at most 20 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password must match",
    path: ["confirmPassword"],
  });