import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { TIME_SLOTS, isDateInPast, isDateOpen } from '@/lib/schedule';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'A valid date query param is required (YYYY-MM-DD).' },
        { status: 400 },
      );
    }

    if (isDateInPast(date)) {
      return NextResponse.json(
        { error: 'Cannot check availability for past dates.' },
        { status: 400 },
      );
    }

    if (!isDateOpen(date)) {
      return NextResponse.json({
        date,
        open: false,
        slots: TIME_SLOTS.map((time) => ({ time, available: false })),
        bookedTimes: [],
      });
    }

    await connectToDatabase();

    const booked = await Booking.find({
      date,
      status: { $in: ['pending', 'confirmed'] },
    })
      .select('time')
      .lean();

    const bookedTimes = booked.map((b) => b.time);

    return NextResponse.json({
      date,
      open: true,
      slots: TIME_SLOTS.map((time) => ({
        time,
        available: !bookedTimes.includes(time),
      })),
      bookedTimes,
    });
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    return NextResponse.json(
      { error: 'Something went wrong while checking availability.' },
      { status: 500 },
    );
  }
}
