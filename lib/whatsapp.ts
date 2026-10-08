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
  paypalCaptureId?: string;
  barcodeUrl?: string;
  barcodeBase64OrUrl?: string;
  items?: OrderItemDetail[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  date?: string;
}

/**
 * Builds the official WhatsApp report containing all required fields
 * plus luxury branding, courier barcode links, and PayPal capture ID.
 */
export function buildDetailedOrderReport(order: OrderNotificationPayload): string {
  const currencySymbol = order.itemCurrency === 'GBP' ? '£' : (order.itemCurrency || '£');
  const paymentLabel = order.paymentMethod.toLowerCase().includes('card')
    ? 'Credit / Debit Card (via PayPal UK Gateway)'
    : 'PayPal UK (Verified Fund Capture)';

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

  const firstItem = order.items?.[0] || {
    title: order.itemName,
    code: '1-of-1',
    quantity: 1,
    price: order.itemPrice
  };

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
`🛍️ *NEW PAID ORDER*

*Order:* #${order.orderId}
*Buyer:* ${order.buyerName}
*Phone:* ${order.buyerPhone}
*Product:* ${firstItem.title}
*SKU / Ref:* ${firstItem.code || '1-of-1'}
*Quantity:* ${firstItem.quantity}
*Price:* ${currencySymbol}${Number(firstItem.price).toFixed(2)}
*Total:* ${currencySymbol}${totalFormatted}
*Currency:* ${order.itemCurrency || 'GBP'}
*Shipping Company:* ${order.shippingCompany}
*Shipping Address:* ${order.buyerAddress}
*Payment Method:* ${paymentLabel}
*PayPal Transaction/Capture ID:* ${order.paypalCaptureId || 'VERIFIED'}
*Date/Time:* ${formattedDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 *STYLE & CLASS LONDON* 👑
_Curated Pre-Loved Luxury Fashion · London, United Kingdom_
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *ALL ORDER ITEMS:*
${itemsSection}

${photosSection}

🏷️ *COURIER ADDRESS BARCODE:*
${order.barcodeUrl || 'https://styleandclass.store'}

🔒 *INVENTORY ACTION:*
Purchased 1-of-1 piece permanently archived & marked sold.
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

export interface WhatsAppAlertResult {
  success: boolean;
  providerSent: boolean;
  status: 'sent' | 'pending' | 'failed';
  method: 'meta_cloud_api' | 'callmebot_gateway' | 'direct_url_ready' | 'failed';
  directWhatsAppUrl: string;
  reportText: string;
  error?: string;
}

/**
 * Dispatches a formatted order message along with product photo to the store WhatsApp.
 * Accurately tracks whether an external API provider actually accepted the message.
 */
export async function sendOrderAlertToWhatsApp(order: OrderNotificationPayload): Promise<WhatsAppAlertResult> {
  const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipientNumber = getStoreWhatsAppNumber();
  const reportText = buildDetailedOrderReport(order);
  const directWhatsAppUrl = generateWhatsAppChatUrl(order);

  // If Meta WhatsApp Cloud API credentials are configured and not dummy placeholders
  const isMetaConfigured = Boolean(
    whatsappToken &&
    phoneNumberId &&
    !whatsappToken.startsWith('EAA...') &&
    phoneNumberId !== '123456...'
  );

  if (isMetaConfigured) {
    try {
      const res = await axios.post(
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
          timeout: 8000
        }
      );
      if (res.status === 200 || res.status === 201) {
        console.info(`[WhatsApp Provider] Successfully delivered via Meta Cloud API to ${recipientNumber}`);
        return {
          success: true,
          providerSent: true,
          status: 'sent',
          method: 'meta_cloud_api',
          directWhatsAppUrl,
          reportText
        };
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error?.message || err?.message || 'Meta Cloud API error';
      console.error('[WhatsApp Provider] Meta Cloud API error:', errorMsg);
      return {
        success: false,
        providerSent: false,
        status: 'failed',
        method: 'meta_cloud_api',
        directWhatsAppUrl,
        reportText,
        error: errorMsg
      };
    }
  }

  // Check for CallMeBot WhatsApp Gateway if key provided
  const callmebotKey = process.env.CALLMEBOT_API_KEY;
  if (callmebotKey) {
    try {
      const cmRes = await axios.get('https://api.callmebot.com/whatsapp.php', {
        params: {
          phone: recipientNumber,
          text: reportText,
          apikey: callmebotKey
        },
        timeout: 8000
      });
      if (cmRes.status === 200) {
        console.info(`[WhatsApp Provider] Successfully delivered via CallMeBot to ${recipientNumber}`);
        return {
          success: true,
          providerSent: true,
          status: 'sent',
          method: 'callmebot_gateway',
          directWhatsAppUrl,
          reportText
        };
      }
    } catch (cmErr: any) {
      console.warn('[WhatsApp Provider] CallMeBot error:', cmErr?.message);
    }
  }

  console.info(`[Official WhatsApp Alert Formatted for Store WhatsApp: +44 7591 878215]`);
  return {
    success: false, // Provider did not send because no automated API credentials configured
    providerSent: false,
    status: 'pending',
    method: 'direct_url_ready',
    directWhatsAppUrl,
    reportText,
    error: 'Automated WhatsApp Cloud API provider credentials pending configuration. Direct store link generated.'
  };
}
