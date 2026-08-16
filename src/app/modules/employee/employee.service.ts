import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

import { QueryBuilder } from "../../utils/QueryBuilder";
import { Employee } from "./employee.model";
import { IEmployee } from "./employee.interface";
import { employeeSearchableFields } from "./employee.constant";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { generateUniqueSlug } from "../../utils/slugify";

const createEmployee = async (payload: IEmployee) => {
  // Email is optional — an empty value shouldn't be treated as a
  // duplicate of every other employee who also has no email on file.
  if (payload.email) {
    const existingEmployee = await Employee.findOne({ email: payload.email });

    if (existingEmployee) {
      throw new AppError(httpStatus.CONFLICT, "Employee with this email already exists");
    }
  }

  const slug = await generateUniqueSlug(payload.name, async (candidate) => Boolean(await Employee.exists({ slug: candidate })));

  const employee = await Employee.create({ ...payload, slug });
  return employee;
};

const updateEmployee = async (id: string, payload: Partial<IEmployee>) => {
  const existingEmployee = await Employee.findById(id);

  if (!existingEmployee) {
    throw new Error("Employee not found.");
  }

  if (payload.email) {
    const duplicateEmployee = await Employee.findOne({
      _id: { $ne: id },
      email: payload.email,
    });

    if (duplicateEmployee) {
      throw new Error("An Employee with this email already exists.");
    }
  }

  // Slugs are kept stable once set (changing them would break already
  // shared/indexed links) — only generate one here for legacy records
  // that predate this feature and still don't have one.
  const nextPayload = { ...payload };
  if (!existingEmployee.slug) {
    nextPayload.slug = await generateUniqueSlug(payload.name || existingEmployee.name, async (candidate) =>
      Boolean(await Employee.exists({ slug: candidate, _id: { $ne: id } })),
    );
  }

  const updatedEmployee = await Employee.findByIdAndUpdate(id, nextPayload, { new: true, runValidators: true });

  if (payload.picture && existingEmployee.picture) {
    await deleteImageFromCLoudinary(existingEmployee.picture);
  }

  return updatedEmployee;
};

const getAllEmployees = async (query: Record<string, string>) => {
  const EmpoyeeQuery = new QueryBuilder(Employee.find(), query).search(employeeSearchableFields).filter().sort().fields().paginate();

  // const meta = await queryBuilder.getMeta()

  const data = await EmpoyeeQuery.modelQuery;
  const meta = await EmpoyeeQuery.countTotal();
  return {
    data,
    meta,
  };
};

// mongoose.Types.ObjectId.isValid() also accepts any 12-character string
// (a raw 12-byte buffer is technically valid too), which would wrongly
// treat a short slug as an id. Match the actual 24-char hex format only.
const isObjectIdString = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

const getSingleEmployee = async (id: string) => {
  const employee = isObjectIdString(id) ? await Employee.findById(id) : await Employee.findOne({ slug: id });

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
