import { model, Schema } from "mongoose";
import { ISiteSettings } from "./siteSettings.interface";

// Singleton collection — there's only ever one settings document.
const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    googleSiteVerification: { type: String },
    bingSiteVerification: { type: String },
  },
  {
    timestamps: true,
  },
);

export const SiteSettings = model<ISiteSettings>("SiteSettings", siteSettingsSchema);
