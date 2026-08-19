import PDFDocument from "pdfkit";
import axios from "axios";
import QRCode from "qrcode";
import { ICertificate } from "./certificate.interface";
import { GEOMARK_LETTERHEAD_BASE64 } from "./certificate.letterhead";

const BRAND_BLUE = "#1B245F";
const TEXT_DARK = "#1F2937";

// The real company letterhead pad — logo, award badges, watermark, border
// and address footer are all already part of this image, so it's drawn
// full-bleed as the page background and everything else is overlaid on
// top of it. Embedded as base64 rather than fetched over the network:
// there's no stable, unhashed public URL for it (the frontend build
// hashes asset filenames on every deploy).
const letterheadBuffer = Buffer.from(GEOMARK_LETTERHEAD_BASE64, "base64");

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

const DEFAULT_POSITIONS = {
  signature: { x: 10, y: 76, width: 22 },
  seal: { x: 34, y: 72, width: 16 },
  qr: { x: 78, y: 72, width: 15 },
};

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
    signature: certificate.positions?.signature ?? DEFAULT_POSITIONS.signature,
    seal: certificate.positions?.seal ?? DEFAULT_POSITIONS.seal,
    qr: certificate.positions?.qr ?? DEFAULT_POSITIONS.qr,
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks: Uint8Array[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const pct = (value: number, of: number) => (value / 100) * of;

      // Letterhead pad, full-bleed background.
      doc.image(letterheadBuffer, 0, 0, { width: pageWidth, height: pageHeight });

      // Title.
      doc
        .fillColor(BRAND_BLUE)
        .font("Helvetica-Bold")
        .fontSize(26)
        .text(certificate.title, 46, 170, { width: pageWidth - 92, align: "center" });

      // Body text.
      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
        .fontSize(13)
        .text(certificate.bodyText, 80, 250, {
          width: pageWidth - 160,
          align: "center",
          lineGap: 6,
        });

      // Issue date, bottom-left area (above the signature row).
      const issueDateText = new Date(certificate.issueDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc
        .fillColor(TEXT_DARK)
        .font("Helvetica")
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
          .font("Helvetica-Bold")
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
        .font("Helvetica")
        .fontSize(7.5)
        .text("Scan to verify", qrX, qrY + qrWidth + 4, { width: qrWidth, align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
