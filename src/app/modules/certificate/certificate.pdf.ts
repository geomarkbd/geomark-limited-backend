import PDFDocument from "pdfkit";
import axios from "axios";
import QRCode from "qrcode";
import { CertificateFontFamily, ICertificate, ICertificateTextStyle } from "./certificate.interface";
import { GEOMARK_LETTERHEAD_BASE64 } from "./certificate.letterhead";
import { ARIAL_NARROW_BOLD_BASE64, ARIAL_NARROW_REGULAR_BASE64 } from "./certificate.fonts";

const BRAND_BLUE = "#1B245F";
const TEXT_DARK = "#1F2937";

// The real company letterhead pad — logo, award badges, watermark, border
// and address footer are all already part of this image, so it's drawn
// full-bleed as the page background and everything else is overlaid on
// top of it. Embedded as base64 rather than fetched over the network:
// there's no stable, unhashed public URL for it (the frontend build
// hashes asset filenames on every deploy).
const letterheadBuffer = Buffer.from(GEOMARK_LETTERHEAD_BASE64, "base64");

const arialNarrowRegularBuffer = Buffer.from(ARIAL_NARROW_REGULAR_BASE64, "base64");
const arialNarrowBoldBuffer = Buffer.from(ARIAL_NARROW_BOLD_BASE64, "base64");

const generateQrBuffer = async (verificationUrl: string): Promise<Buffer> => {
  return QRCode.toBuffer(verificationUrl, {
    type: "png",
    margin: 1,
    width: 400,
    color: { dark: BRAND_BLUE, light: "#FFFFFF" },
  });
};

// Signature/seal are stored as Cloudinary URLs (uploaded via multer). pdfkit's
// doc.image() only accepts a Buffer or a local file path — never a remote
// URL — so these have to be fetched into memory first, or they silently
// fail to embed (swallowed by the try/catch around doc.image() below).
const fetchImageBuffer = async (url?: string): Promise<Buffer | null> => {
  if (!url) return null;
  try {
    const response = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 10000 });
    return Buffer.from(response.data);
  } catch (error) {
    console.warn("Certificate PDF: could not fetch image, skipping.", url, (error as Error).message);
    return null;
  }
};

// Registers the custom "Arial Narrow" substitute (see certificate.fonts.ts)
// under names pickFont() can address. Font registration is per-document in
// pdfkit, so this runs once at the top of every generateCertificatePdf call.
// There's no italic face for this family — both italic slots point at the
// same upright glyphs rather than being left unregistered (which would
// throw when selected instead of just rendering non-slanted).
const registerCustomFonts = (doc: PDFKit.PDFDocument) => {
  doc.registerFont("ArialNarrow", arialNarrowRegularBuffer);
  doc.registerFont("ArialNarrow-Bold", arialNarrowBoldBuffer);
  doc.registerFont("ArialNarrow-Italic", arialNarrowRegularBuffer);
  doc.registerFont("ArialNarrow-BoldItalic", arialNarrowBoldBuffer);
};

const FONT_MAP: Record<CertificateFontFamily, { regular: string; bold: string; italic: string; boldItalic: string }> = {
  times: { regular: "Times-Roman", bold: "Times-Bold", italic: "Times-Italic", boldItalic: "Times-BoldItalic" },
  helvetica: { regular: "Helvetica", bold: "Helvetica-Bold", italic: "Helvetica-Oblique", boldItalic: "Helvetica-BoldOblique" },
  "arial-narrow": { regular: "ArialNarrow", bold: "ArialNarrow-Bold", italic: "ArialNarrow-Italic", boldItalic: "ArialNarrow-BoldItalic" },
};

const pickFont = (style: ResolvedTextStyle) => {
  const map = FONT_MAP[style.fontFamily] ?? FONT_MAP.times;
  if (style.bold && style.italic) return map.boldItalic;
  if (style.bold) return map.bold;
  if (style.italic) return map.italic;
  return map.regular;
};

type ResolvedTextStyle = Required<ICertificateTextStyle>;

// Times New Roman is the new default (was Helvetica) — an exact, always-
// available pdfkit built-in that reads as a formal/certificate typeface,
// which is what was asked for. "Arial Narrow" is offered as an alternative
// (see certificate.fonts.ts for the substitution note).
const DEFAULT_TITLE_STYLE: ResolvedTextStyle = {
  bold: true,
  italic: false,
  underline: false,
  align: "center",
  fontFamily: "times",
  fontSize: 26,
  lineSpacing: 1,
  paragraphSpacing: 0,
};
const DEFAULT_BODY_STYLE: ResolvedTextStyle = {
  bold: false,
  italic: false,
  underline: false,
  align: "center",
  fontFamily: "times",
  fontSize: 13,
  lineSpacing: 1.3,
  paragraphSpacing: 0,
};

// Explicit field-by-field merge rather than a spread: certificate is a live
// Mongoose document, and spreading its (single embedded subdocument)
// titleStyle/bodyStyle can silently yield an empty object since those
// fields aren't own-enumerable on the subdocument instance — property
// access (via the schema-defined getters) always works, enumeration doesn't.
const resolveStyle = (style: ICertificateTextStyle | undefined, defaults: ResolvedTextStyle): ResolvedTextStyle => ({
  bold: style?.bold ?? defaults.bold,
  italic: style?.italic ?? defaults.italic,
  underline: style?.underline ?? defaults.underline,
  align: style?.align ?? defaults.align,
  fontFamily: style?.fontFamily ?? defaults.fontFamily,
  fontSize: style?.fontSize ?? defaults.fontSize,
  lineSpacing: style?.lineSpacing ?? defaults.lineSpacing,
  paragraphSpacing: style?.paragraphSpacing ?? defaults.paragraphSpacing,
});

// pdfkit's lineGap is an absolute point value, not the "1x / 1.5x / 2x"
// multiplier admins actually think in — convert once here.
const lineGapFor = (style: ResolvedTextStyle) => style.fontSize * (style.lineSpacing - 1);

const DEFAULT_POSITIONS = {
  title: { x: 8, y: 20, width: 84 },
  body: { x: 13, y: 29, width: 74 },
  signature: { x: 10, y: 76, width: 22 },
  seal: { x: 34, y: 72, width: 16 },
  qr: { x: 78, y: 72, width: 15 },
};

/** Minimum gap, in pt, kept between the bottom of the title and the top of the body. */
const TITLE_BODY_MIN_GAP = 14;

type GenerateArgs = {
  certificate: ICertificate;
  verificationUrl: string;
};

/**
 * Renders a certificate on top of the real Geomark letterhead pad (drawn
 * full-bleed as the background), with the title/body text plus a
 * positioned signature, seal and QR code overlaid on top. Positions are
 * percentages of the page so admin-chosen layouts (dragged in the admin
 * UI) map 1:1 onto the generated PDF.
 */
export const generateCertificatePdf = async ({ certificate, verificationUrl }: GenerateArgs): Promise<Buffer> => {
  const [qrBuffer, signatureImageBuffer, sealImageBuffer] = await Promise.all([
    generateQrBuffer(verificationUrl),
    fetchImageBuffer(certificate.signatureImage),
    fetchImageBuffer(certificate.sealImage),
  ]);

  const positions = {
    title: certificate.positions?.title ?? DEFAULT_POSITIONS.title,
    body: certificate.positions?.body ?? DEFAULT_POSITIONS.body,
    signature: certificate.positions?.signature ?? DEFAULT_POSITIONS.signature,
    seal: certificate.positions?.seal ?? DEFAULT_POSITIONS.seal,
    qr: certificate.positions?.qr ?? DEFAULT_POSITIONS.qr,
  };
  const titleStyle = resolveStyle(certificate.titleStyle, DEFAULT_TITLE_STYLE);
  const bodyStyle = resolveStyle(certificate.bodyStyle, DEFAULT_BODY_STYLE);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks: Uint8Array[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      registerCustomFonts(doc);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const pct = (value: number, of: number) => (value / 100) * of;

      // Letterhead pad, full-bleed background.
      doc.image(letterheadBuffer, 0, 0, { width: pageWidth, height: pageHeight });

      // Title.
      const titleFont = pickFont(titleStyle);
      const titleX = pct(positions.title.x, pageWidth);
      const titleY = pct(positions.title.y, pageHeight);
      const titleWidth = pct(positions.title.width, pageWidth);
      doc.font(titleFont).fontSize(titleStyle.fontSize);
      // Measured before drawing so the body can be pushed clear of it below —
      // a title that wraps onto more lines than the fixed default gap
      // assumes (a long title, or a larger font size) would otherwise print
      // directly on top of the body text.
      const titleHeight = doc.heightOfString(certificate.title, {
        width: titleWidth,
        align: titleStyle.align,
        lineGap: lineGapFor(titleStyle),
      });
      doc
        .fillColor(BRAND_BLUE)
        .text(certificate.title, titleX, titleY, {
          width: titleWidth,
          align: titleStyle.align,
          underline: titleStyle.underline,
          lineGap: lineGapFor(titleStyle),
          paragraphGap: titleStyle.paragraphSpacing,
        });

      // Body text — starts wherever the admin positioned it, unless the
      // title (once actually measured above) would run into it, in which
      // case it's pushed down just far enough to clear it.
      const bodyFont = pickFont(bodyStyle);
      const bodyX = pct(positions.body.x, pageWidth);
      const configuredBodyY = pct(positions.body.y, pageHeight);
      const bodyY = Math.max(configuredBodyY, titleY + titleHeight + TITLE_BODY_MIN_GAP);
      doc
        .fillColor(TEXT_DARK)
        .font(bodyFont)
        .fontSize(bodyStyle.fontSize)
        .text(certificate.bodyText, bodyX, bodyY, {
          width: pct(positions.body.width, pageWidth),
          align: bodyStyle.align,
          underline: bodyStyle.underline,
          lineGap: lineGapFor(bodyStyle),
          paragraphGap: bodyStyle.paragraphSpacing,
        });

      // Issue date, bottom-left area (above the signature row).
      const issueDateText = new Date(certificate.issueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc
        .fillColor(TEXT_DARK)
        .font("Times-Roman")
        .fontSize(10)
        .text(`Issued: ${issueDateText}`, 46, pct(positions.signature.y, pageHeight) - 18, { width: 220 });

      // Signature (image and name are independent — a failed image fetch
      // shouldn't also hide the signatory's name).
      const sigWidth = pct(positions.signature.width, pageWidth);
      if (signatureImageBuffer) {
        try {
          doc.image(signatureImageBuffer, pct(positions.signature.x, pageWidth), pct(positions.signature.y, pageHeight), {
            width: sigWidth,
          });
        } catch {
          // Skip if the stored image can't be embedded (e.g. unsupported format).
        }
      }
      if (certificate.signatureName) {
        doc
          .fillColor(TEXT_DARK)
          .font("Times-Bold")
          .fontSize(10)
          .text(certificate.signatureName, pct(positions.signature.x, pageWidth), pct(positions.signature.y, pageHeight) + sigWidth * 0.42 + 6, {
            width: sigWidth + 40,
          });
      }

      // Seal.
      if (sealImageBuffer) {
        try {
          doc.image(sealImageBuffer, pct(positions.seal.x, pageWidth), pct(positions.seal.y, pageHeight), {
            width: pct(positions.seal.width, pageWidth),
          });
        } catch {
          // Skip if the stored image can't be embedded.
        }
      }

      // QR code + caption.
      const qrWidth = pct(positions.qr.width, pageWidth);
      const qrX = pct(positions.qr.x, pageWidth);
      const qrY = pct(positions.qr.y, pageHeight);
      doc.image(qrBuffer, qrX, qrY, { width: qrWidth });
      doc
        .fillColor(TEXT_DARK)
        .font("Times-Roman")
        .fontSize(7.5)
        .text("Scan to verify", qrX, qrY + qrWidth + 4, { width: qrWidth, align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
