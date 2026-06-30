import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';

const REQUIRED_FIELDS = [
  'service',
  'date',
  'time',
  'name',
  'email',
  'phone',
] as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const missing = REQUIRED_FIELDS.filter((field) => !body[field]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missing.join(', ')}.` },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(String(body.email))) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const booking = await Booking.create({
      service: body.service,
      date: body.date,
      time: body.time,
      name: body.name,
      email: body.email,
      phone: body.phone,
    });

    return NextResponse.json(
      { message: 'Booking created successfully.', booking },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: 'Something went wrong while creating your booking.' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching bookings.' },
      { status: 500 },
    );
  }
}
