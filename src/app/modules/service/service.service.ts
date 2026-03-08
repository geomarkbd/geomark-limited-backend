import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IService } from "./service.interface";
import { serviceSearchableFields } from "./service.constant";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Service } from "./service.model";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createService = async (payload: IService) => {
  const exsitingService = await Service.findOne({ name: payload.name });

  if (exsitingService) {
    throw new AppError(httpStatus.CONFLICT, "Service with this name already exists");
  }

  const service = await Service.create(payload);
  return service;
};

const updateService = async (id: string, payload: Partial<IService>) => {
  const existingService = await Service.findById(id);

  const existingServiceName = await Service.findOne({ name: payload.name });

  if (!existingService) {
    throw new Error("Service not found.");
  }

  if (existingServiceName) {
    throw new AppError(httpStatus.CONFLICT, "Service with this name already exists");
  }

  const duplicateProject = await Service.findOne({
    name: payload.name,
  });

  if (duplicateProject) {
    throw new Error("A Service with this name already exists.");
  }

  //

  const updatedProject = await Service.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

  if (payload.picture && existingService.picture) {
    await deleteImageFromCLoudinary(existingService.picture);
  }

  return updatedProject;
};

const getAllServices = async (query: Record<string, string>) => {
  const ServiceQuery = new QueryBuilder(Service.find(), query).search(serviceSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const data = await ServiceQuery.modelQuery;
  const meta = await ServiceQuery.countTotal();
  return {
    data,
    meta,
  };
};

const getSingleService = async (id: string) => {
  const service = await Service.findById(id);
  return {
    data: service,
  };
};

const deleteService = async (id: string) => {
  return await Service.findByIdAndDelete(id);
};

export const ServiceService = {
  createService,
  updateService,
  getAllServices,
  getSingleService,
  deleteService,
};
