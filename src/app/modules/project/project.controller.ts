import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProjectService } from "./project.service";
import { IProject } from "./project.interface";

const createProject = catchAsync(async (req: Request, res: Response) => {
  const payload: IProject = {
    ...req.body,
    picture: req.file?.path,
  };

  // const payload = req.body;
  const result = await ProjectService.createProject(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const payload: IProject = {
    ...req.body,
    picture: req.file?.path,
  };
  const result = await ProjectService.updateProject(id, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const getAllProjects = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ProjectService.getAllProjects(query as Record<string, string>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Projects retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleProject = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await ProjectService.getSingleProject(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project retrieved successfully",
    data: result,
  });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ProjectService.deleteProject(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project deleted successfully",
    data: result,
  });
});

export const ProjectController = {
  createProject,
  getAllProjects,
  getSingleProject,
  updateProject,
  deleteProject,
};
