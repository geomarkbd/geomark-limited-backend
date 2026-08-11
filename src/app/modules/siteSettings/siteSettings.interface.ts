export interface ISiteSettings {
  /**
   * The `content` value from Google's Search Console "HTML tag"
   * ownership verification method — i.e. just the token, not the whole
   * <meta> tag. Search Console shows it as:
   *   <meta name="google-site-verification" content="THIS_PART" />
   */
  googleSiteVerification?: string;
  /**
   * Same idea for Bing Webmaster Tools' meta tag verification method.
   */
  bingSiteVerification?: string;
}
