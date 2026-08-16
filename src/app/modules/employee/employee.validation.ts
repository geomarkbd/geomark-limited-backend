import z from "zod";

// Matches the frontend's optional-email pattern (addEmployeeSchema in
// employee.schema.ts) and the Mongoose model, which doesn't require
// email either. The form sends "" (not undefined) when left blank, so
// .optional() alone isn't enough — .email() still rejects "".
const optionalEmail = z.union([z.string().email({ message: "Invalid email address format." }), z.literal("")]).optional();

export const createEmployeeZodSchema = z.object({
  name: z.string({ invalid_type_error: "Name must be a string" }),
  email: optionalEmail,
  phone: z.string(),
  address: z.string().optional(),
  designation: z.string({ invalid_type_error: "Designation is required" }),
  rank: z.string({ invalid_type_error: "Rank is required" }),
  description: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  institute: z.string().optional(),
  education: z.string().optional(),
  joinDate: z.string().optional(),
  picture: z.string().optional(),
});

export const updateEmployeeZodSchema = z.object({
  name: z.string().min(1).optional(),
  email: optionalEmail,
  phone: z.string().optional(),
  address: z.string().optional(),
  designation: z.string().optional(),
  rank: z.string().optional(),
  description: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  institute: z.string().optional(),
  education: z.string().optional(),
  picture: z.string().optional(),
  joinDate: z.string().optional(),
});
