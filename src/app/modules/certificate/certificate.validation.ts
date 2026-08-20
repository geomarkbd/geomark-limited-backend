import z from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
});

const textStyleSchema = z.object({
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
  fontFamily: z.enum(["times", "helvetica", "arial-narrow"]).optional(),
  fontSize: z.number().min(6).max(96).optional(),
  lineSpacing: z.number().min(0.5).max(4).optional(),
  paragraphSpacing: z.number().min(0).max(60).optional(),
});

export const createCertificateZodSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  bodyText: z.string().trim().min(1, "Body text is required"),
  titleStyle: textStyleSchema.optional(),
  bodyStyle: textStyleSchema.optional(),
  signatureName: z.string().trim().optional(),
  issueDate: z.string().optional(),
  positions: z
    .object({
      title: positionSchema.optional(),
      body: positionSchema.optional(),
      signature: positionSchema.optional(),
      seal: positionSchema.optional(),
      qr: positionSchema.optional(),
    })
    .optional(),
});

export const updateCertificateZodSchema = createCertificateZodSchema.partial().extend({
  status: z.enum(["ACTIVE", "REVOKED"]).optional(),
});
