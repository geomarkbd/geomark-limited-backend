import z from "zod";

export const updateSiteSettingsZodSchema = z.object({
  googleSiteVerification: z.string().trim().optional(),
  bingSiteVerification: z.string().trim().optional(),
});
