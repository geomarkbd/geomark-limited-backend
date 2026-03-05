import express from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProductController } from "./product.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { createProductZodSchema, updateProductZodSchema } from "./product.validation";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();
router.post(
  "/create-product",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(createProductZodSchema),
  ProductController.createProduct,
);
router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
  multerUpload.single("file"),
  validateRequest(updateProductZodSchema),
  ProductController.updateProduct,
);

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getSingleProduct);

router.delete("/:id", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), ProductController.deleteProduct);

export const ProductRoutes = router;
