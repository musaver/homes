import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';
import { and, eq, not } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Get all booked time slots for the given date
    // Only consider confirmed orders (not cancelled)
    const bookedOrders = await db
      .select({
        serviceTime: orders.serviceTime,
        status: orders.status,
      })
      .from(orders)
      .where(
        and(
          eq(orders.serviceDate, date),
          not(eq(orders.status, 'cancelled'))
        )
      );

    console.log(`🔍 Checking availability for ${date}:`, bookedOrders);

    // Extract booked time slots
    const bookedSlots = bookedOrders
      .map(order => order.serviceTime)
      .filter(time => time && time.trim() !== '');

    // Define all available time slots (same as DateTimePicker)
    const allTimeSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
      "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    // Calculate available slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));

    console.log(`✅ Available slots for ${date}:`, availableSlots);
    console.log(`❌ Booked slots for ${date}:`, bookedSlots);

    return NextResponse.json({
      date,
      availableSlots,
      bookedSlots,
      totalSlots: allTimeSlots.length,
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length
    });

  } catch (error) {
    console.error('Error checking slot availability:', error);
    return NextResponse.json({ 
      error: 'Failed to check slot availability' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { serviceDate, serviceTime } = body;

    if (!serviceDate || !serviceTime) {
      return NextResponse.json({ 
        error: 'serviceDate and serviceTime are required' 
      }, { status: 400 });
    }

    // Check if the specific slot is available
    const existingBooking = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
      })
      .from(orders)
      .where(
        and(
          eq(orders.serviceDate, serviceDate),
          eq(orders.serviceTime, serviceTime),
          not(eq(orders.status, 'cancelled'))
        )
      )
      .limit(1);

    const isAvailable = existingBooking.length === 0;

    console.log(`🔍 Slot availability check:`, {
      serviceDate,
      serviceTime,
      isAvailable,
      existingBooking: existingBooking[0] || null
    });

    return NextResponse.json({
      available: isAvailable,
      serviceDate,
      serviceTime,
      conflictingOrder: existingBooking[0] || null
    });

  } catch (error) {
    console.error('Error checking specific slot availability:', error);
    return NextResponse.json({ 
      error: 'Failed to check slot availability' 
    }, { status: 500 });
  }
}
