import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the id from params
    const { id } = await params;

    // Fetch order with all its details
    const [order] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        subtotal: orders.subtotal,
        vatAmount: orders.vatAmount,
        serviceAmount: orders.serviceAmount,
        totalAmount: orders.totalAmount,
        email: orders.email,
        phone: orders.phone,
        shippingAddress1: orders.shippingAddress1,
        shippingAddress2: orders.shippingAddress2,
        shippingCity: orders.shippingCity,
        shippingState: orders.shippingState,
        shippingPostalCode: orders.shippingPostalCode,
        shippingCountry: orders.shippingCountry,
        notes: orders.notes,
        serviceDate: orders.serviceDate,
        serviceTime: orders.serviceTime,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    // Format the response
    const formattedOrder = {
      ...order,
      items: items.map(item => ({
        ...item,
        addons: item.addons && typeof item.addons === 'string' ? JSON.parse(item.addons) : null,
      })),
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
} 