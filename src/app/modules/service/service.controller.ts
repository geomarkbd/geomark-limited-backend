import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceService } from "./service.service";
import { IService } from "./service.interface";

const createService = catchAsync(async (req: Request, res: Response) => {
  const payload: IService = {
    ...req.body,
    picture: req.file?.path,
  };

  // const payload = req.body;
  const result = await ServiceService.createService(payload);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Service created successfully",
    data: result,
  });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const payload: IService = {
    ...req.body,
    picture: req.file?.path,
  };

  const result = await ServiceService.updateService(id, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await ServiceService.getAllServices(query as Record<string, string>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Services retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleService = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const result = await ServiceService.getSingleService(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service retrieved successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await ServiceService.deleteService(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
});

export const ServiceController = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
};
