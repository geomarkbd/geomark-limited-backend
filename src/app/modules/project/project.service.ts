import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IProject } from "./project.interface";
import { Project } from "./project.model";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { projectSearchableFields } from "./project.constant";

const createProject = async (payload: IProject) => {
  const existingProjectName = await Project.findOne({ name: payload.name });

  if (existingProjectName) {
    throw new AppError(httpStatus.CONFLICT, "Project with this name already exists");
  }

  const project = await Project.create(payload);
  return project;
};

const updateProject = async (id: string, payload: Partial<IProject>) => {
  const existingProject = await Project.findById(id);

  if (!existingProject) {
    throw new AppError(httpStatus.NOT_FOUND, "Project not found");
  }

  const existingProjectName = await Project.findOne({
    name: payload.name,
    _id: { $ne: id },
  });

  if (existingProjectName) {
    throw new AppError(httpStatus.CONFLICT, "Project with this name already exists");
  }

  const startDate = payload.startDate ?? existingProject.startDate;
  const endDate = payload.endDate ?? existingProject.endDate;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, "endDate cannot be earlier than startDate");
  }

  if (payload.gallery !== undefined) {
    if (!Array.isArray(payload.gallery)) {
      throw new AppError(httpStatus.BAD_REQUEST, "gallery must be an array of image paths");
    }

    const cleanedGallery = payload.gallery.map((item) => String(item).trim()).filter((item) => item.length > 0);

    if (cleanedGallery.length !== payload.gallery.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "gallery cannot contain empty values");
    }

    const uniqueGallery = [...new Set(cleanedGallery)];

    if (uniqueGallery.length > 10) {
      throw new AppError(httpStatus.BAD_REQUEST, "gallery cannot contain more than 10 images");
    }

    payload.gallery = uniqueGallery;
  }

  const updatedProject = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.picture && existingProject.picture) {
    await deleteImageFromCLoudinary(existingProject.picture);
  }

  if (payload.gallery) {
    const oldGallery = existingProject.gallery || [];
    const newGallery = payload.gallery || [];

    const removedImages = oldGallery.filter((img) => !newGallery.includes(img));

    for (const image of removedImages) {
      await deleteImageFromCLoudinary(image);
    }
  }

  return updatedProject;
};

const getAllProjects = async (query: Record<string, string>) => {
  const projectQuery = new QueryBuilder(Project.find().populate("client"), query).search(projectSearchableFields).filter().sort().paginate().fields();

  const data = await projectQuery.modelQuery;
  const meta = await projectQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getSingleProject = async (id: string) => {
  const project = await Project.findById(id);
  return {
    data: project,
  };
};

const deleteProject = async (id: string) => {
  return await Project.findByIdAndDelete(id);
};

export const ProjectService = {
  createProject,
  updateProject,
  getAllProjects,
  getSingleProject,
  deleteProject,
};
