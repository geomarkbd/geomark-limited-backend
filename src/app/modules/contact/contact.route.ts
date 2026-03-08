import { Router } from "express";
import { ContactController } from "./contact.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createContactValidationSchema } from "./contact.validation";
const router = Router();

router.post("/send-message", validateRequest(createContactValidationSchema), ContactController.sendContactMessage);

export const ContactRoutes = router;
