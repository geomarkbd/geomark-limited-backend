import crypto from "crypto";
import httpStatus from "http-status-codes";
import QRCode from "qrcode";

import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../config/env";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Certificate } from "./certificate.model";
import { CertificateStatus, ICertificate } from "./certificate.interface";
import { generateCertificatePdf } from "./certificate.pdf";

// Random, non-guessable — a certificate verification link should not be
// enumerable (no sequential IDs, nothing derived from the title).
const generateSlug = async (): Promise<string> => {
  let candidate: string;
  let exists: boolean;

  do {
    candidate = crypto.randomBytes(9).toString("base64url");
    exists = Boolean(await Certificate.exists({ slug: candidate }));
  } while (exists);

  return candidate;
};

export const buildVerificationUrl = (slug: string) => `${envVars.FRONTEND_URL.replace(/\/$/, "")}/certificate/${slug}`;

type CreateCertificatePayload = Partial<ICertificate> & {
  signatureImage?: string;
  sealImage?: string;
};

const createCertificate = async (payload: CreateCertificatePayload) => {
  const slug = await generateSlug();
  const verificationUrl = buildVerificationUrl(slug);

  // Stored as a data URL directly on the document — a few KB of PNG, no
  // separate file storage needed. (The PDF itself is intentionally *not*
  // pre-generated/stored here — see certificate.pdf.ts / the /pdf route:
  // Cloudinary's PDF delivery is restricted on this account by default,
  // so the PDF is rendered fresh from stored data on every download
  // instead of depending on that being turned on.)
  const qrCodeImage = await QRCode.toDataURL(verificationUrl, { margin: 1, width: 400 });

  const certificate = await Certificate.create({
    slug,
    title: payload.title,
    bodyText: payload.bodyText,
    titleStyle: payload.titleStyle,
    bodyStyle: payload.bodyStyle,
    signatureImage: payload.signatureImage,
    signatureName: payload.signatureName,
    sealImage: payload.sealImage,
    positions: payload.positions,
    issueDate: payload.issueDate ? new Date(payload.issueDate) : new Date(),
    status: CertificateStatus.ACTIVE,
    qrCodeImage,
  });

  return { certificate, verificationUrl };
};

const getAllCertificates = async (query: Record<string, string>) => {
  const certificateQuery = new QueryBuilder(Certificate.find(), query).search(["title", "slug"]).filter().sort().fields().paginate();

  const data = await certificateQuery.modelQuery;
  const meta = await certificateQuery.countTotal();
  return { data, meta };
};

const getCertificateBySlug = async (slug: string) => {
  const certificate = await Certificate.findOne({ slug });
  return certificate;
};

const updateCertificate = async (slug: string, payload: Partial<ICertificate>) => {
  const existing = await Certificate.findOne({ slug });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Certificate not found");
  }

  const updated = await Certificate.findOneAndUpdate(
    { slug },
    { ...payload, issueDate: payload.issueDate ? new Date(payload.issueDate) : undefined },
    { new: true, runValidators: true, omitUndefined: true },
  );
  return updated;
};

const deleteCertificate = async (slug: string) => {
  return Certificate.findOneAndDelete({ slug });
};

/** Renders the PDF fresh from the stored certificate data — see the note in createCertificate. */
const getCertificatePdfBuffer = async (slug: string) => {
  const certificate = await Certificate.findOne({ slug });
  if (!certificate) {
    throw new AppError(httpStatus.NOT_FOUND, "Certificate not found");
  }

  const verificationUrl = buildVerificationUrl(slug);
  const buffer = await generateCertificatePdf({ certificate, verificationUrl });
  return { buffer, certificate };
};

export const CertificateService = {
  createCertificate,
  getAllCertificates,
  getCertificateBySlug,
  updateCertificate,
  deleteCertificate,
  getCertificatePdfBuffer,
};
