import express from "express";
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

// Public: the verification page needs this to show a scanned certificate
// with no login — this is the whole point of the QR flow. The page itself
// stays out of search results via noindex + sitemap/robots exclusion, not
// through the API being private.
router.get("/verify/:slug", CertificateController.getCertificateBySlug);

// Public, rendered fresh on every request (see certificate.service.ts —
// Cloudinary's PDF delivery is restricted on this account, so nothing is
// pre-uploaded to fetch from).
router.get("/verify/:slug/pdf", CertificateController.downloadCertificatePdf);

export const CertificateRoutes = router;
