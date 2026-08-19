export enum CertificateStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

/** Percentage-based so the layout scales with the canvas at any render size. */
export interface ICertificatePosition {
  x: number; // % from left
  y: number; // % from top
  width: number; // % of canvas width
}

export interface ICertificatePositions {
  signature?: ICertificatePosition;
  seal?: ICertificatePosition;
  qr?: ICertificatePosition;
}

export interface ICertificate {
  slug: string;
  title: string;
  bodyText: string;
  signatureImage?: string;
  signatureName?: string;
  sealImage?: string;
  positions?: ICertificatePositions;
  issueDate: Date;
  status: CertificateStatus;
  /** Data URL — small enough to store inline, no separate file needed. */
  qrCodeImage?: string;
}
