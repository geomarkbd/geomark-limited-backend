import { z } from "zod";

export const createProductZodSchema = z.object({
  name: z.string({ invalid_type_error: "Name is required" }),
  description: z.string({ invalid_type_error: "Description is required" }),
  location: z.string({ invalid_type_error: "Location is required" }),
  price: z.number({ invalid_type_error: "Price must be a number" }),
  quantity: z.number({ invalid_type_error: "Quantity must be a number" }),
  address: z.string().optional(),
  picture: z.string().optional(),
});

export const updateProductZodSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  price: z.number().optional(),
  quantity: z.number().optional(),
  picture: z.string().optional(),
  removeGallery: z.array(z.string()).optional(),
});
