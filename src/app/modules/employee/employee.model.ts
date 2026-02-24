import { model, Schema } from "mongoose";
import { IEmployee } from "./employee.interface";

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    designation: { type: String, required: true },
    picture: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    twitter: { type: String },

    joinDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const Employee = model<IEmployee>("Employee", employeeSchema);
