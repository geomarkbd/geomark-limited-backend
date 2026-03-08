import { model, Schema } from "mongoose";
import { INews } from "./news.interface";

const NewsSchema = new Schema<INews>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    picture: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const News = model<INews>("News", NewsSchema);
