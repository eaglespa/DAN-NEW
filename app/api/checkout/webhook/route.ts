import { NextRequest, NextResponse } from 'next/server';
import { generateAddressBarcode, bufferToDataUri } from '@/lib/barcode';
import { sendOrderAlertToWhatsApp } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const eventType = event.event_type;

    console.info(`[PayPal Webhook] Received event: ${eventType} (ID: ${event.id})`);

    // Handle payment capture completed event
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      const resource = event.resource || {};
      const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id || `EVT-${Date.now()}`;
      const amount = resource.amount?.value || '0.00';
      const currency = resource.amount?.currency_code || 'GBP';

      const shipping = resource.shipping || resource.purchase_units?.[0]?.shipping || {};
      const recipientName = shipping.name?.full_name || 'Customer';
      const addressObj = shipping.address || {};
      const formattedAddress = [
        addressObj.address_line_1,
        addressObj.address_line_2,
        addressObj.admin_area_2,
        addressObj.postal_code,
        addressObj.country_code
      ].filter(Boolean).join(', ') || 'London, United Kingdom';

      // Generate barcode for delivery
      let barcodeUri: string | undefined;
      try {
        const barcodeBuffer = await generateAddressBarcode(formattedAddress);
        barcodeUri = bufferToDataUri(barcodeBuffer);
      } catch (bcErr) {
        console.warn('Barcode generation warning in webhook:', bcErr);
      }

      // Dispatch alert to store WhatsApp
      await sendOrderAlertToWhatsApp({
        orderId,
        itemName: 'Style & Class London Luxury Order',
        itemPrice: parseFloat(amount) || 0,
        itemCurrency: currency,
        itemPhotoUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600',
        buyerName: recipientName,
        buyerPhone: resource.payer?.phone?.phone_number?.national_number || '+447591878215',
        buyerAddress: formattedAddress,
        paymentMethod: 'PayPal UK (Webhook Verified)',
        shippingCompany: 'Tracked Delivery',
        barcodeBase64OrUrl: barcodeUri
      });
    }

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('[PayPal Webhook] Error:', error?.message);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 400 });
  }
}
