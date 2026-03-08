import { validateRequest } from "../../middlewares/validateRequest";
import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

import { multerUpload } from "../../config/multer.config";
import { createNewsZodSchema, updateNewsZodSchema } from "./news.validation";
import { NewsController } from "./news.controller";

const router = express.Router();
router.post(
  "/create-news",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(createNewsZodSchema),
  NewsController.createNews,
);

router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(updateNewsZodSchema),
  NewsController.updateNews,
);

router.get("/", NewsController.getAllNewss);
router.get("/:id", NewsController.getSingleNews);

router.delete("/:id", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), NewsController.deleteNews);

export const NewsRoutes = router;
