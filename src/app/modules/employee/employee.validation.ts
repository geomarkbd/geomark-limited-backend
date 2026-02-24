import z from "zod";

export const createEmployeeZodSchema = z.object({
  name: z.string({ invalid_type_error: "Email must be string" }),
  email: z.string({ invalid_type_error: "Email must be string" }).email({ message: "Invalid email address format." }),
  phone: z.string({ invalid_type_error: "Phone is required" }),
  address: z.string().optional(),
  designation: z.string({ invalid_type_error: "Designation is required" }),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  picture: z.string().optional(),
  joinDate: z.string().optional(),
});

export const updateEmployeeZodSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  designation: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  picture: z.string().optional(),
  joinDate: z.string().optional(),
});
