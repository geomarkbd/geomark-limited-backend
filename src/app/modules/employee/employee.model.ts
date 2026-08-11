import { model, Schema } from "mongoose";
import { IEmployee } from "./employee.interface";

const employeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    designation: { type: String, required: true },
    description: { type: String },
    rank: { type: String, required: true },
    picture: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
    institute: { type: String },
    education: { type: String },

    joinDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const Employee = model<IEmployee>("Employee", employeeSchema);
