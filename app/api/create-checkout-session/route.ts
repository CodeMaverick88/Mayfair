// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createProvisionalBooking } from '@/lib/bookings-store';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) throw new Error('Missing STRIPE_SECRET_KEY env');

const stripe = new Stripe(stripeSecret, { apiVersion: '2026-06-24.dahlia' });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, startDate, endDate, guests, name, email, items = [], total = 0 } = body;

    if (!roomId || !startDate || !endDate || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // create provisional booking
    const booking = await createProvisionalBooking({
      roomId,
      startDate,
      endDate,
      guests,
      name,
      email,
      items,
      total,
      status: 'pending_payment'
    });

    // Stripe line item creation (single combined line item)
    // Note: currency handling must match your Stripe account. If KES not supported, convert accordingly.
    const amountInMinor = Math.round(Number(total) * 100); // e.g., KES cents (verify)
    const origin = process.env.NEXT_PUBLIC_BASE_URL ?? `http://${(req.headers.get('host') ?? 'localhost:3000')}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'kes',
            product_data: { name: `Booking ${booking.id}`, description: `${name} — ${startDate} to ${endDate}` },
            unit_amount: amountInMinor,
          },
          quantity: 1,
        }
      ],
      customer_email: email,
      metadata: {
        bookingId: booking.id,
        roomId,
      },
      success_url: `${origin}/rooms?session_id={CHECKOUT_SESSION_ID}&booking=${booking.id}`,
      cancel_url: `${origin}/rooms?canceled=1`,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error('create-checkout-session error', err);
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}