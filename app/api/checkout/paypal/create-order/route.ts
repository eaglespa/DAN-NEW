import { NextRequest, NextResponse } from 'next/server';
import { createPayPalOrder } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'GBP' } = body;

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const orderData = await createPayPalOrder(numAmount, currency);
    return NextResponse.json({ success: true, orderID: orderData.id, ...orderData });
  } catch (error: any) {
    console.error('Next.js create-order error:', error?.response?.data || error.message);
    return NextResponse.json(
      { error: error?.response?.data?.message || error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
