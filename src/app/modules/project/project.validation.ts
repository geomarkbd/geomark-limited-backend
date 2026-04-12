import { z } from "zod";
import { ProjectStatus } from "./project.interface";

const validDateString = z.string().refine((value) => !isNaN(Date.parse(value)), {
  message: "Invalid date format",
});

export const createProjectZodSchema = z
  .object({
    service: z
      .string()
      .trim()
      .regex(/^[a-f\d]{24}$/i, "Invalid service id"),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    objective: z.string().optional(),
    responsibility: z.string().optional(),
    status: z.nativeEnum(ProjectStatus),
    startDate: validDateString,
    endDate: validDateString.optional(),
    location: z.string().min(1, "Location is required"),
    client: z
      .string()
      .trim()
      .regex(/^[a-f\d]{24}$/i, "Invalid client id"),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate > endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate cannot be earlier than startDate",
        });
      }
    }
  });

export const updateProjectZodSchema = z
  .object({
    service: z
      .string()
      .trim()
      .regex(/^[a-f\d]{24}$/i, "Invalid service id")
      .optional(),
    name: z.string().min(1, "Name cannot be empty").optional(),
    description: z.string().min(1, "Description cannot be empty").optional(),
    objective: z.string().optional(),
    responsibility: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    startDate: validDateString.optional(),
    endDate: validDateString.optional(),
    location: z.string().min(1, "Location cannot be empty").optional(),
    client: z
      .string()
      .trim()
      .regex(/^[a-f\d]{24}$/i, "Invalid client id")
      .optional(),

    // for multipart/form-data
    // send like: ["url1","url2"]
    removeGallery: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (startDate > endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate cannot be earlier than startDate",
        });
      }
    }

    if (data.removeGallery) {
      try {
        const parsed = JSON.parse(data.removeGallery);

        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["removeGallery"],
            message: "removeGallery must be a JSON array of strings",
          });
          return;
        }

        const allStrings = parsed.every((item) => typeof item === "string");

        if (!allStrings) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["removeGallery"],
            message: "removeGallery must contain only strings",
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["removeGallery"],
          message: "removeGallery must be valid JSON",
        });
      }
    }
  });
