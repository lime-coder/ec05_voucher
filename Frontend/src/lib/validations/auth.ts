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
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  dob: z.string().min(1, "Date of birth is required")
    .refine((val) => {
      if (!val) return false;
      const dob = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      return age >= 13;
    }, { message: "You must be at least 13 years old to register" }),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(1, "Address is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const registerPartnerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  password: passwordRule,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  companyName: z.string().min(1, "Company name is required"),
  companyEmail: z.string().email("Invalid company email address"),
  companyPhone: z.string().min(10, "Phone number must be at least 10 characters"),
  taxId: z.string().regex(/^\d{10}(\d{3})?$/, "Tax ID must be 10 or 13 digits"),
  legalRep: z.string().min(1, "Legal representative is required"),
  businessField: z.string().min(1, "Business field is required"),
  jobPosition: z.string().min(1, "Job position is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterPartnerInput = z.infer<typeof registerPartnerSchema>;
