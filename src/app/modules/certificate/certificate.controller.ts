import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { CertificateService } from "./certificate.service";

type UploadedFiles = { [fieldname: string]: Express.Multer.File[] };

const createCertificate = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles | undefined;

  const payload = {
    ...req.body,
    signatureImage: files?.signature?.[0]?.path,
    sealImage: files?.seal?.[0]?.path,
  };

  const result = await CertificateService.createCertificate(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Certificate generated successfully",
    data: result,
  });
});

const getAllCertificates = catchAsync(async (req: Request, res: Response) => {
  const result = await CertificateService.getAllCertificates(req.query as Record<string, string>);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certificates retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCertificateBySlug = catchAsync(async (req: Request, res: Response) => {
  const certificate = await CertificateService.getCertificateBySlug(req.params.slug as string);

  if (!certificate) {
    throw new AppError(httpStatus.NOT_FOUND, "Certificate not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certificate retrieved successfully",
    data: certificate,
  });
});

const updateCertificate = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as UploadedFiles | undefined;

  const payload = {
    ...req.body,
    ...(files?.signature?.[0]?.path && { signatureImage: files.signature[0].path }),
    ...(files?.seal?.[0]?.path && { sealImage: files.seal[0].path }),
  };

  const certificate = await CertificateService.updateCertificate(req.params.slug as string, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certificate updated successfully",
    data: certificate,
  });
});

const deleteCertificate = catchAsync(async (req: Request, res: Response) => {
  const certificate = await CertificateService.deleteCertificate(req.params.slug as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Certificate deleted successfully",
    data: certificate,
  });
});

const downloadCertificatePdf = catchAsync(async (req: Request, res: Response) => {
  const { buffer, certificate } = await CertificateService.getCertificatePdfBuffer(req.params.slug as string);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename="${certificate.slug}.pdf"`,
    "Content-Length": buffer.length,
  });
  res.status(httpStatus.OK).send(buffer);
});

const ALLOWED_SCANNED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const uploadScannedDocument = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file uploaded");
  }
  if (!ALLOWED_SCANNED_DOCUMENT_TYPES.includes(req.file.mimetype)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only PDF, JPG, PNG or WEBP files are allowed");
  }

  const certificate = await CertificateService.uploadScannedDocument(req.params.slug as string, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Scanned copy uploaded successfully",
    data: certificate,
  });
});

const deleteScannedDocument = catchAsync(async (req: Request, res: Response) => {
  const certificate = await CertificateService.deleteScannedDocument(req.params.slug as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Scanned copy removed successfully",
    data: certificate,
  });
});

const downloadScannedDocument = catchAsync(async (req: Request, res: Response) => {
  const doc = await CertificateService.getScannedDocument(req.params.slug as string);

  res.set({
    "Content-Type": doc.contentType,
    "Content-Disposition": `inline; filename="${doc.fileName || `${req.params.slug}-certificate`}"`,
    "Content-Length": doc.data.length,
  });
  res.status(httpStatus.OK).send(doc.data);
});

export const CertificateController = {
  createCertificate,
  getAllCertificates,
  getCertificateBySlug,
  updateCertificate,
  deleteCertificate,
  downloadCertificatePdf,
  uploadScannedDocument,
  deleteScannedDocument,
  downloadScannedDocument,
};
