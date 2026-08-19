export enum CertificateStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

export type CertificateTextAlign = "left" | "center" | "right" | "justify";

/** Block-level formatting applied to the whole title or the whole body text. */
export interface ICertificateTextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: CertificateTextAlign;
}

/** Percentage-based so the layout scales with the canvas at any render size. */
export interface ICertificatePosition {
  x: number; // % from left
  y: number; // % from top
  width: number; // % of canvas width
}

export interface ICertificatePositions {
  title?: ICertificatePosition;
  body?: ICertificatePosition;
  signature?: ICertificatePosition;
  seal?: ICertificatePosition;
  qr?: ICertificatePosition;
}

export interface ICertificate {
  slug: string;
  title: string;
  bodyText: string;
  titleStyle?: ICertificateTextStyle;
  bodyStyle?: ICertificateTextStyle;
  signatureImage?: string;
  signatureName?: string;
  sealImage?: string;
  positions?: ICertificatePositions;
  issueDate: Date;
  status: CertificateStatus;
  /** Data URL — small enough to store inline, no separate file needed. */
  qrCodeImage?: string;
}
