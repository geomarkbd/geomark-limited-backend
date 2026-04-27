import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./user.controller";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { Role } from "./user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post("/register", validateRequest(createUserZodSchema), multerUpload.single("file"), UserControllers.createUser);
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);
router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser);

router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  multerUpload.single("file"),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUser,
);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.deleteUser);

export const UserRoutes = router;
