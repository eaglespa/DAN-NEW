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
  shippingCompany: string;
  barcodeBase64OrUrl?: string;
}

/**
 * Dispatches a formatted order message along with product photo to the store WhatsApp.
 */
export async function sendOrderAlertToWhatsApp(order: OrderNotificationPayload) {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipientNumber = getStoreWhatsAppNumber();

  if (!whatsappToken || !phoneNumberId) {
    console.warn('WhatsApp API credentials not found. Notification logged to console:');
    console.info(JSON.stringify(order, null, 2));
    return { success: false, reason: 'MISSING_API_CREDENTIALS' };
  }

  const messageText = 
`🛍️ *NEW ORDER ALERT - #${order.orderId}*

📦 *Item Details:*
• *Product:* ${order.itemName}
• *Price:* ${order.itemPrice.toFixed(2)} ${order.itemCurrency}

👤 *Customer Info:*
• *Name:* ${order.buyerName}
• *Phone:* ${order.buyerPhone}
• *Shipping Address:* ${order.buyerAddress}

🚚 *Logistics:*
• *Selected Carrier:* ${order.shippingCompany}

🏷️ *Address Barcode attached for shipment scanning.*`;

  try {
    // 1. Send Product Image with the Order Summary caption
    await axios.post(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientNumber,
        type: 'image',
        image: {
          link: order.itemPhotoUrl,
          caption: messageText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true };
  } catch (err: any) {
    console.error('WhatsApp message send failed:', err?.response?.data || err?.message);
    return { success: false, error: err?.response?.data || err?.message };
  }
}
