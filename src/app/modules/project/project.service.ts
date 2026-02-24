import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

import { QueryBuilder } from "../../utils/QueryBuilder";
import { IProject } from "./project.interface";
import { Project } from "./project.model";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { projectSearchableFields } from "./project.constant";

const createProject = async (payload: IProject) => {
  const existingProjectName = await Project.findOne({ name: payload.name });
  // const existingProjecttitle = await Project.findOne({ title: payload.title });

  if (existingProjectName) {
    throw new AppError(httpStatus.CONFLICT, "Project with this name already exists");
  }
  // if (existingProjecttitle) {
  //   throw new AppError(httpStatus.CONFLICT, "Project with this title already exists");
  // }

  const project = await Project.create(payload);
  return project;
};

const updateProject = async (id: string, payload: Partial<IProject>) => {
  const existingProject = await Project.findById(id);

  const existingProjectName = await Project.findOne({ name: payload.name });
  const existingProjecttitle = await Project.findOne({ title: payload.title });

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  if (existingProjectName) {
    throw new AppError(httpStatus.CONFLICT, "Project with this name already exists");
  }
  if (existingProjecttitle) {
    throw new AppError(httpStatus.CONFLICT, "Project with this title already exists");
  }

  const duplicateProject = await Project.findOne({
    name: payload.name,
  });

  if (duplicateProject) {
    throw new Error("A Project with this name already exists.");
  }

  //

  const updatedProject = await Project.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

  if (payload.picture && existingProject.picture) {
    await deleteImageFromCLoudinary(existingProject.picture);
  }

  return updatedProject;
};

const getAllProjects = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Project.find().populate("client"), query);

  const projects = await queryBuilder.search(projectSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const [data, meta] = await Promise.all([projects.build(), queryBuilder.getMeta()]);
  return {
    data,
    meta,
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
