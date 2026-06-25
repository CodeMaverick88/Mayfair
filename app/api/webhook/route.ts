// app/api/webhook/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { markBookingPaid } from '@/lib/bookings-store';
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY');
if (!webhookSecret) console.warn('Missing STRIPE_WEBHOOK_SECRET - webhook signature verification disabled');

const stripe = new Stripe(stripeSecret);

export async function POST(req: Request) {
  const payload = await req.arrayBuffer();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(Buffer.from(payload), sig, webhookSecret);
    } else {
      // If no webhook secret provided (dev only), parse JSON directly
      const text = new TextDecoder().decode(payload);
      event = JSON.parse(text) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook verification failed:', err?.message);
    return new Response(`Webhook Error: ${err?.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await markBookingPaid(String(bookingId), { stripeSessionId: session.id, paidAt: new Date().toISOString() });
      console.log(`Booking ${bookingId} marked as paid. Email: ${session.customer_email}`);
      // TODO: send email notification using your mail provider
    } else {
      console.warn('No bookingId in session metadata');
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}