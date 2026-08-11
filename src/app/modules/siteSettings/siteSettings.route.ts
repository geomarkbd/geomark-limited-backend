import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { SiteSettingsController } from "./siteSettings.controller";
import { updateSiteSettingsZodSchema } from "./siteSettings.validation";

const router = express.Router();

// Public: the frontend needs this on every page load to render the
// verification <meta> tags for search engine crawlers, no auth required.
router.get("/", SiteSettingsController.getSiteSettings);

router.patch("/", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), validateRequest(updateSiteSettingsZodSchema), SiteSettingsController.updateSiteSettings);

export const SiteSettingsRoutes = router;
