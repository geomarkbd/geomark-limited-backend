import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SiteSettingsService } from "./siteSettings.service";

const getSiteSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteSettingsService.getSiteSettings();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site settings retrieved successfully",
    data: result,
  });
});

const updateSiteSettings = catchAsync(async (req: Request, res: Response) => {
  const result = await SiteSettingsService.updateSiteSettings(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Site settings updated successfully",
    data: result,
  });
});

export const SiteSettingsController = {
  getSiteSettings,
  updateSiteSettings,
};
