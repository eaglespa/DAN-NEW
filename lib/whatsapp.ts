import axios from 'axios';
import { getStoreWhatsAppNumber } from './config.js';

export interface OrderNotificationPayload {
  orderId: string;
  itemName: string;
  itemPrice: number;
  itemCurrency: string;
  itemPhotoUrl: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  paymentMethod: string;
  shippingCompany: string;
  barcodeUrl?: string;
  barcodeBase64OrUrl?: string;
}

/**
 * Builds the comprehensive WhatsApp report containing all required fields.
 */
export function buildDetailedOrderReport(order: OrderNotificationPayload): string {
  const currencySymbol = order.itemCurrency === 'GBP' ? '£' : order.itemCurrency;
  const paymentLabel = order.paymentMethod.toLowerCase().includes('card')
    ? 'Credit / Debit Card (Direct Bank Card Settlement)'
    : 'PayPal UK (Express / Pay in 3)';

  return (
`🛍️ *STYLE & CLASS LONDON — NEW PAID ORDER ALERT*
━━━━━━━━━━━━━━━━━━━━━━━━
🧾 *ORDER ID:* #${order.orderId}
💳 *BUYER PAYMENT METHOD:* ${paymentLabel} (PAID & VERIFIED)

👤 *BUYER INFORMATION*
• *Buyer Name:* ${order.buyerName}
• *Buyer Address:* ${order.buyerAddress}
• *Buyer Phone Number:* ${order.buyerPhone}

📦 *SOLD ITEM DETAILS*
• *Sold Item Name:* ${order.itemName}
• *Sold Item Price:* ${currencySymbol}${order.itemPrice.toFixed(2)}
• *Sold Item Photo:* ${order.itemPhotoUrl}

🚚 *SHIPPING COMPANY (CHOSEN BY BUYER)*
• *Courier:* ${order.shippingCompany}

🏷️ *BUYER ADDRESS (BARCODE FOR COURIER)*
• *Scannable Barcode:* ${order.barcodeUrl || 'Scannable on receipt & packing slip'}
━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Dispatch within 24h as per Style & Class UK shipping promise.*`
  );
}

/**
 * Generates direct WhatsApp click-to-chat URL targeting store WhatsApp number.
 */
export function generateWhatsAppChatUrl(order: OrderNotificationPayload): string {
  const storePhone = getStoreWhatsAppNumber();
  const text = buildDetailedOrderReport(order);
  return `https://api.whatsapp.com/send?phone=${storePhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Dispatches a formatted order message along with product photo to the store WhatsApp.
 */
export async function sendOrderAlertToWhatsApp(order: OrderNotificationPayload) {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipientNumber = getStoreWhatsAppNumber();
  const reportText = buildDetailedOrderReport(order);
  const directWhatsAppUrl = generateWhatsAppChatUrl(order);

  // If Meta WhatsApp Cloud API credentials are configured, send automatically via Meta Graph
  if (whatsappToken && phoneNumberId) {
    try {
      await axios.post(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientNumber,
          type: 'image',
          image: {
            link: order.itemPhotoUrl,
            caption: reportText,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return { success: true, directWhatsAppUrl, reportText, method: 'meta_cloud_api' };
    } catch (err: any) {
      console.error('Meta WhatsApp Cloud API error:', err?.response?.data || err?.message);
    }
  }

  // Check for CallMeBot WhatsApp Gateway if key provided
  const callmebotKey = process.env.CALLMEBOT_API_KEY;
  if (callmebotKey) {
    try {
      await axios.get('https://api.callmebot.com/whatsapp.php', {
        params: {
          phone: recipientNumber,
          text: reportText,
          apikey: callmebotKey
        }
      });
      return { success: true, directWhatsAppUrl, reportText, method: 'callmebot_gateway' };
    } catch (cmErr: any) {
      console.warn('CallMeBot notification warning:', cmErr?.message);
    }
  }

  console.info('[WhatsApp Alert Generated]');
  console.info(reportText);

  return {
    success: true,
    directWhatsAppUrl,
    reportText,
    method: 'direct_url_ready'
  };
}
