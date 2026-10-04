/**
 * Store-wide configuration settings.
 * Reads the phone number from website constants or environment variables
 * and formats it strictly for WhatsApp API usage (E.164 digits only).
 */

export const STORE_CONFIG = {
  storeName: 'Style and Class',
  // Default phone number from site contacts or environment variables
  rawPhoneNumber: process.env.STORE_PHONE_NUMBER || process.env.NEXT_PUBLIC_STORE_PHONE || process.env.WHATSAPP_BUSINESS_PHONE || '+447591878215',
  currency: process.env.STORE_CURRENCY || 'GBP',
  defaultShippingCarrier: 'Evri Standard Tracked',
};

/**
 * Normalizes phone numbers to standard WhatsApp format (digits only, including country code).
 * Example: "+44 7591 878215" -> "447591878215"
 */
export function getStoreWhatsAppNumber(): string {
  const digitsOnly = STORE_CONFIG.rawPhoneNumber.replace(/\D/g, '');
  return digitsOnly || '447591878215';
}
