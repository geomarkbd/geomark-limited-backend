import { Schema, model } from "mongoose";
import { IProject, ProjectStatus } from "./project.interface";

const projectSchema = new Schema<IProject>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    objective: {
      type: String,
      trim: true,
    },
    responsibility: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    year: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
    },
    gallery: {
      type: [String],
      default: [],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.pre("validate", function (next) {
  if (this.startDate) {
    this.year = this.startDate.getFullYear().toString();
  }

  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate("endDate", "endDate cannot be earlier than startDate");
  }

  next();
});

export const Project = model("Project", projectSchema);
