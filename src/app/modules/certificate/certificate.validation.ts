import z from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
});

export const createCertificateZodSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  bodyText: z.string().trim().min(1, "Body text is required"),
  signatureName: z.string().trim().optional(),
  issueDate: z.string().optional(),
  positions: z
    .object({
      signature: positionSchema.optional(),
      seal: positionSchema.optional(),
      qr: positionSchema.optional(),
    })
    .optional(),
});

export const updateCertificateZodSchema = createCertificateZodSchema.partial().extend({
  status: z.enum(["ACTIVE", "REVOKED"]).optional(),
});
