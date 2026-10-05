import axios from 'axios';
import { getStoreWhatsAppNumber } from './config.js';

export interface OrderItemDetail {
  title: string;
  code?: string;
  price: number;
  quantity: number;
  photoUrl?: string;
  size?: string;
}

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
  items?: OrderItemDetail[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  date?: string;
}

/**
 * Builds the official, prestigiously designed WhatsApp report containing all 6 required fields
 * plus company emblem, luxury branding, payment confirmation, and barcode links.
 */
export function buildDetailedOrderReport(order: OrderNotificationPayload): string {
  const currencySymbol = order.itemCurrency === 'GBP' ? '£' : (order.itemCurrency || '£');
  const paymentLabel = order.paymentMethod.toLowerCase().includes('card')
    ? 'Credit / Debit Card (Bank Card Settlement)'
    : 'PayPal UK (Express / Pay in 3 / Balance)';

  const formattedDate = order.date || new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalFormatted = (order.total || order.itemPrice).toFixed(2);
  const cleanPhone = (order.buyerPhone || '').replace(/[^0-9]/g, '');
  const cleanBuyerPhoneLink = cleanPhone ? `https://wa.me/${cleanPhone}` : 'N/A';

  // Format multiple items or single item
  let itemsSection = '';
  let photosSection = '';
  if (order.items && order.items.length > 0) {
    itemsSection = order.items.map((it, idx) => 
      `• *Item ${idx + 1}:* ${it.title} [${it.code || '1-of-1'}]\n  - *Price:* ${currencySymbol}${it.price.toFixed(2)} (Qty: ${it.quantity}${it.size ? `, Size: ${it.size}` : ''})`
    ).join('\n');

    photosSection = order.items.map((it, idx) => 
      `📸 *Photo ${idx + 1} (${it.title}):*\n${it.photoUrl || order.itemPhotoUrl}`
    ).join('\n\n');
  } else {
    itemsSection = `• *Name:* ${order.itemName}\n• *Price:* ${currencySymbol}${order.itemPrice.toFixed(2)}`;
    photosSection = `📸 *Photo:*\n${order.itemPhotoUrl}`;
  }

  return (
`👑 *STYLE & CLASS LONDON* 👑
_Curated Pre-Loved Luxury Fashion · London, United Kingdom_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚜️ *OFFICIAL ORDER DISPATCH ALERT* ⚜️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧾 *ORDER ID:* #${order.orderId}
📅 *DATE:* ${formattedDate}
💳 *PAYMENT METHOD:* ${paymentLabel} (PAID & VERIFIED)
💰 *TOTAL PAID:* ${currencySymbol}${totalFormatted} GBP

👤 *1. BUYER NAME*
• Full Name: *${order.buyerName}*

📍 *2. BUYER ADDRESS*
• Delivery Address: *${order.buyerAddress}*
• Country: United Kingdom (GB)

📞 *3. BUYER PHONE NUMBER*
• Contact Phone: *${order.buyerPhone}*
• Direct WhatsApp: ${cleanBuyerPhoneLink}

🏷️ *4. BUYER ADDRESS (BARCODE FOR COURIER)*
• Scannable Barcode URL:
${order.barcodeUrl || 'https://styleandclass.store'}
_(Scan directly with courier scanner / phone camera to verify address)_

📦 *5. ITEM DETAILS*
${itemsSection}
• Condition: Pre-Loved / Excellent (Unique 1-of-1 Piece)

${photosSection}

🚚 *6. SHIPPING COMPANY (CHOSEN BY BUYER)*
• Selected Courier: *${order.shippingCompany}*
• Dispatch SLA: Dispatched within 24 Hours Tracked

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 *1-OF-1 INVENTORY ACTION:*
Item permanently archived & deleted from active storefront.
🇬🇧 *Style & Class London · styleandclass.store*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );
}

/**
 * Generates direct WhatsApp click-to-chat URL targeting store WhatsApp number (+44 7591 878215).
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

  console.info('[Official WhatsApp Alert Generated for +44 7591 878215]');
  console.info(reportText);

  return {
    success: true,
    directWhatsAppUrl,
    reportText,
    method: 'direct_url_ready'
  };
}
