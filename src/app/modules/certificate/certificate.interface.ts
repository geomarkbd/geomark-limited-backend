export enum CertificateStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED",
}

export type CertificateTextAlign = "left" | "center" | "right" | "justify";

/**
 * "times" and "helvetica" map to pdfkit's built-in Times/Helvetica families.
 * "arial-narrow" is backed by an embedded free substitute — see
 * certificate.fonts.ts for why.
 */
export type CertificateFontFamily = "times" | "helvetica" | "arial-narrow";

/** Block-level formatting applied to the whole title or the whole body text. */
export interface ICertificateTextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: CertificateTextAlign;
  fontFamily?: CertificateFontFamily;
  fontSize?: number; // pt
  /** Multiplier, e.g. 1 = single, 1.5 = 1.5x, 2 = double. */
  lineSpacing?: number;
  /** Extra space in pt added after each line — see certificate.pdf.ts for why this isn't just "between paragraphs". */
  paragraphSpacing?: number;
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

/**
 * A physically signed-and-sealed copy (built in Word from the downloaded QR
 * code, then scanned) that replaces the auto-generated certificate as the
 * thing people see when they scan the QR. Stored inline like the QR code —
 * `data` is excluded from normal queries (see certificate.model.ts) so
 * fetching a certificate or the certificate list doesn't drag its bytes
 * along; only the dedicated download route selects it.
 */
export interface ICertificateScannedDocument {
  data: Buffer;
  contentType: string;
  fileName?: string;
  uploadedAt: Date;
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
  scannedDocument?: ICertificateScannedDocument;
}
