import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    year: { type: String },
    location: { type: String, required: true },
    picture: { type: String },
    gallery: [{ type: String }],
    client: { type: String, required: true },
  },
  { timestamps: true },
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
