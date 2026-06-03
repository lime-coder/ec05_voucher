import { z } from "zod";

const passwordRule = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one digit");

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerCustomerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: passwordRule,
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
