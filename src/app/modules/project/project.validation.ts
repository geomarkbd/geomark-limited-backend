import { z } from "zod";
import { ProjectStatus } from "./project.interface";

export const createProjectZodSchema = z.object({
  title: z.string({ invalid_type_error: "Title is required" }),
  name: z.string({ invalid_type_error: "Name is required" }),
  description: z.string({ invalid_type_error: "Description is required" }),
  details: z.string({ invalid_type_error: "Details is required" }),
  status: z.enum(Object.values(ProjectStatus) as [string]),
  startDate: z.string({ invalid_type_error: "Start Date is required" }),
  endDate: z.string().optional(),
  year: z.string().optional(),
  location: z.string(),
  client: z.string({ invalid_type_error: "Client ID is required" }),
  picture: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

export const updateProjectZodSchema = z.object({
  title: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  details: z.string().optional(),
  status: z.enum(Object.values(ProjectStatus) as [string]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  year: z.string().optional(),
  location: z.string().optional(),
  client: z.string().optional(),
  picture: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});
