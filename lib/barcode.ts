import bwipjs from 'bwip-js';

/**
 * Encodes the customer address into a scannable barcode image Buffer.
 * For full physical addresses (often 40+ characters), a 2D QR barcode is used
 * because 1D barcodes (Code 128) become too wide to fit on standard delivery stickers.
 */
export async function generateAddressBarcode(addressText: string): Promise<Buffer> {
  if (!addressText || addressText.trim().length === 0) {
    throw new Error('Address text cannot be empty for barcode generation.');
  }

  return await bwipjs.toBuffer({
    bcid: 'qrcode',       // 2D Barcode (QR Code) for multi-line address text
    text: addressText.trim(),
    scale: 3,
    height: 10,
    includetext: false,
    textxalign: 'center',
  });
}

/**
 * Converts a barcode buffer into a base64 Data URI for inline display or storage.
 */
export function bufferToDataUri(buffer: Buffer, mimeType = 'image/png'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
