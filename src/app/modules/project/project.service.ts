import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IProject, TUpdateProjectPayload } from "./project.interface";
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

const updateProject = async (id: string, payload: TUpdateProjectPayload) => {
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

  if (payload.startDate) {
    payload.year = new Date(payload.startDate).getFullYear().toString();
  }

  const startDate = payload.startDate ?? existingProject.startDate;
  const endDate = payload.endDate ?? existingProject.endDate;

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, "endDate cannot be earlier than startDate");
  }

  const existingGallery = existingProject.gallery || [];
  const newGallery = payload.gallery || [];
  const removeGallery = payload.removeGallery || [];

  const filteredGallery = existingGallery.filter((img) => !removeGallery.includes(img));

  payload.gallery = [...new Set([...filteredGallery, ...newGallery])];

  const updatedProject = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("service", "name")
    .populate("client", "name");

  if (payload.picture && existingProject.picture) {
    await deleteImageFromCLoudinary(existingProject.picture);
  }

  for (const image of removeGallery) {
    await deleteImageFromCLoudinary(image);
  }

  return updatedProject;
};

const getAllProjects = async (query: Record<string, string>) => {
  const projectQuery = new QueryBuilder(Project.find().populate("service", "name").populate("client", "name"), query)
    .search(projectSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await projectQuery.modelQuery;
  const meta = await projectQuery.countTotal();

  return {
    meta,
    data,
  };
};

const getSingleProject = async (id: string) => {
  const project = await Project.findById(id).populate("service", "name").populate("client", "name");
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
