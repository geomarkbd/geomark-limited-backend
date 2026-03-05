import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: { type: String },
    picture: { type: String },
    joinDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Product = model<IProduct>("Product", ProductSchema);
