import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all orders for the user
    const userOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        subtotal: orders.subtotal,
        vatAmount: orders.vatAmount,
        serviceAmount: orders.serviceAmount,
        totalAmount: orders.totalAmount,
        serviceDate: orders.serviceDate,
        serviceTime: orders.serviceTime,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt));

    // Fetch items for all orders
    const orderIds = userOrders.map(order => order.id);
    const allItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderIds[0])); // Using first order ID as example

    // Group items by order ID
    const itemsByOrder = allItems.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push({
        ...item,
        addons: item.addons ? JSON.parse(item.addons) : null,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Combine orders with their items
    const ordersWithItems = userOrders.map(order => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
} 