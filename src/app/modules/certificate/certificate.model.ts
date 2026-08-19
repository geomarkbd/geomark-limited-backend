import { model, Schema } from "mongoose";
import { CertificateStatus, ICertificate } from "./certificate.interface";

const positionSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
  },
  { _id: false },
);

const textStyleSchema = new Schema(
  {
    bold: { type: Boolean },
    italic: { type: Boolean },
    underline: { type: Boolean },
    align: { type: String, enum: ["left", "center", "right", "justify"] },
  },
  { _id: false },
);

const certificateSchema = new Schema<ICertificate>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    bodyText: { type: String, required: true },
    titleStyle: { type: textStyleSchema },
    bodyStyle: { type: textStyleSchema },
    signatureImage: { type: String },
    signatureName: { type: String, trim: true },
    sealImage: { type: String },
    positions: {
      title: { type: positionSchema },
      body: { type: positionSchema },
      signature: { type: positionSchema },
      seal: { type: positionSchema },
      qr: { type: positionSchema },
    },
    issueDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: Object.values(CertificateStatus), default: CertificateStatus.ACTIVE },
    qrCodeImage: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Certificate = model<ICertificate>("Certificate", certificateSchema);
