import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

import { QueryBuilder } from "../../utils/QueryBuilder";
import { Employee } from "./employee.model";
import { IEmployee } from "./employee.interface";
import { employeeSearchableFields } from "./employee.constant";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createEmployee = async (payload: IEmployee) => {
  const existingEmployee = await Employee.findOne({ email: payload.email });

  if (existingEmployee) {
    throw new AppError(httpStatus.CONFLICT, "Employee with this email already exists");
  }

  const employee = await Employee.create(payload);
  return employee;
};

const updateEmployee = async (id: string, payload: Partial<IEmployee>) => {
  const existingEmployee = await Employee.findById(id);

  if (!existingEmployee) {
    throw new Error("Employee not found.");
  }

  const duplicateEmployee = await Employee.findOne({
    email: payload.email,
  });

  if (duplicateEmployee) {
    throw new Error("An Employee with this email already exists.");
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

  if (payload.picture && existingEmployee.picture) {
    await deleteImageFromCLoudinary(existingEmployee.picture);
  }

  return updatedEmployee;
};

const getAllEmployees = async (query: Record<string, string>) => {
  const EmpoyeeQuery = new QueryBuilder(Employee.find(), query).search(employeeSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const data = EmpoyeeQuery.modelQuery;
  const meta = EmpoyeeQuery.countTotal();
  return {
    data,
    meta,
  };
};

const getSingleEmployee = async (id: string) => {
  const employee = await Employee.findById(id);
  return {
    data: employee,
  };
};

const deleteEmployee = async (id: string) => {
  return await Employee.findByIdAndDelete(id);
};

export const EmployeeService = {
  createEmployee,
  updateEmployee,
  getAllEmployees,
  getSingleEmployee,
  deleteEmployee,
};
