import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: orderId } = await params;

    // Fetch specific order for the user
    const [order] = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.id, orderId),
        eq(orders.userId, session.user.id)
      ))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    // Return items with addons as-is from database
    const itemsWithParsedAddons = items.map(item => ({
      ...item,
      addons: item.addons // Drizzle handles JSON fields automatically
    }));

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: itemsWithParsedAddons
      }
    });

  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
} 