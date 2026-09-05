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
    fontFamily: { type: String, enum: ["times", "helvetica", "arial-narrow"] },
    fontSize: { type: Number },
    lineSpacing: { type: Number },
    paragraphSpacing: { type: Number },
  },
  { _id: false },
);

// `data` is select: false — normal fetches (list, verify) get to know a
// scanned copy exists (contentType/fileName/uploadedAt) without dragging
// its bytes along; only the dedicated download route explicitly selects it.
const scannedDocumentSchema = new Schema(
  {
    data: { type: Buffer, required: true, select: false },
    contentType: { type: String, required: true },
    fileName: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const certificateSchema = new Schema<ICertificate>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    // Not required: a certificate designed entirely in Word around the
    // downloaded QR code can be created with both left blank.
    title: { type: String, default: "", trim: true },
    bodyText: { type: String, default: "" },
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
    scannedDocument: { type: scannedDocumentSchema },
  },
  {
    timestamps: true,
  },
);

export const Certificate = model<ICertificate>("Certificate", certificateSchema);
