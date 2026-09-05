import express from "express";
import multer from "multer";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { CertificateController } from "./certificate.controller";
import { createCertificateZodSchema, updateCertificateZodSchema } from "./certificate.validation";

const router = express.Router();

const certificateImageFields = multerUpload.fields([
  { name: "signature", maxCount: 1 },
  { name: "seal", maxCount: 1 },
]);

// Memory storage, not the shared Cloudinary-backed `multerUpload` — the
// scanned copy is often a PDF, and Cloudinary's public delivery of PDF/ZIP
// is restricted on this account, so the raw bytes are kept in Mongo instead
// and served through our own route (see certificate.service.ts).
const scannedDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
}).single("scannedDocument");

// Admin-only: creating, listing, editing and deleting certificates.
router.post(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  certificateImageFields,
  validateRequest(createCertificateZodSchema),
  CertificateController.createCertificate,
);

router.get("/", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), CertificateController.getAllCertificates);

router.patch(
  "/:slug",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  certificateImageFields,
  validateRequest(updateCertificateZodSchema),
  CertificateController.updateCertificate,
);

router.delete("/:slug", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), CertificateController.deleteCertificate);

// Admin-only: replace/remove the physically signed-and-sealed scanned copy
// (downloaded QR -> built in Word -> printed, signed, scanned -> uploaded
// here) that the public page prefers over the auto-generated certificate.
router.patch("/:slug/scanned-document", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), scannedDocumentUpload, CertificateController.uploadScannedDocument);
router.delete("/:slug/scanned-document", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), CertificateController.deleteScannedDocument);

// Public: the verification page needs this to show a scanned certificate
// with no login — this is the whole point of the QR flow. The page itself
// stays out of search results via noindex + sitemap/robots exclusion, not
// through the API being private.
router.get("/verify/:slug", CertificateController.getCertificateBySlug);

// Public, rendered fresh on every request (see certificate.service.ts —
// Cloudinary's PDF delivery is restricted on this account, so nothing is
// pre-uploaded to fetch from).
router.get("/verify/:slug/pdf", CertificateController.downloadCertificatePdf);

// Public: the uploaded scanned copy, when one exists.
router.get("/verify/:slug/scanned-document", CertificateController.downloadScannedDocument);

export const CertificateRoutes = router;
