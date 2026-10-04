import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/paypal';
import { generateAddressBarcode, bufferToDataUri } from '@/lib/barcode';
import { sendOrderAlertToWhatsApp } from '@/lib/whatsapp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderID, customerDetails, itemDetails, shippingCarrier } = body;

    if (!orderID || !customerDetails || !itemDetails) {
      return NextResponse.json({ error: 'Missing required order metadata.' }, { status: 400 });
    }

    // 1. Capture payment through PayPal API
    const captureData = await capturePayPalOrder(orderID);

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment capture was not completed.' }, { status: 402 });
    }

    // 2. Generate Address Barcode Buffer
    const barcodeBuffer = await generateAddressBarcode(customerDetails.address);
    const barcodeDataUri = bufferToDataUri(barcodeBuffer);

    // 3. Dispatch WhatsApp Notification
    await sendOrderAlertToWhatsApp({
      orderId: orderID,
      itemName: itemDetails.name,
      itemPrice: Number(itemDetails.price),
      itemCurrency: itemDetails.currency || 'GBP',
      itemPhotoUrl: itemDetails.photoUrl,
      buyerName: customerDetails.name,
      buyerPhone: customerDetails.phone,
      buyerAddress: customerDetails.address,
      paymentMethod: body.paymentMethod === 'card_uk' ? 'Credit / Debit Card' : 'PayPal UK',
      shippingCompany: shippingCarrier || 'Standard Tracked Delivery',
      barcodeBase64OrUrl: barcodeDataUri,
    });

    return NextResponse.json({
      success: true,
      captureId: captureData.id,
      status: 'COMPLETED',
    });
  } catch (error: any) {
    console.error('Order Capture & Alert Error:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
