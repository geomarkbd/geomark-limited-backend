import { SiteSettings } from "./siteSettings.model";
import { ISiteSettings } from "./siteSettings.interface";

const getSiteSettings = async () => {
  const settings = await SiteSettings.findOne();
  return settings || {};
};

const updateSiteSettings = async (payload: Partial<ISiteSettings>) => {
  // Singleton upsert: there's only ever one settings document.
  const settings = await SiteSettings.findOneAndUpdate({}, { $set: payload }, { new: true, upsert: true, runValidators: true });
  return settings;
};

export const SiteSettingsService = {
  getSiteSettings,
  updateSiteSettings,
};
