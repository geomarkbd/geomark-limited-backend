import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendEmail } from "../../utils/sendEmail";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";

const sendContactMessage = catchAsync(async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  await sendEmail({
    to: envVars.EMAIL_SENDER.SMTP_FROM, // admin email
    subject: `Contact Form: ${subject}`,
    templateName: "contactMessage",
    templateData: {
      name,
      email,
      subject,
      message,
    },
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Message sent successfully",
    data: null,
  });
});

export const ContactController = { sendContactMessage };
