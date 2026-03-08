import { z } from "zod";

export const createProductZodSchema = z.object({
  name: z.string({ invalid_type_error: "Name is required" }),
  email: z.string({ invalid_type_error: "Email must be string" }).email({ message: "Invalid email address format." }),
  phone: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  address: z.string().optional(),
  picture: z.string().optional(),
});

export const updateProductZodSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  address: z.string().optional(),
  picture: z.string().optional(),
});
// .refine((data) => Object.keys(data).length > 0, {
//   message: "At least one field must be updated",
// }),
