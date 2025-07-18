import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, user } from '@/lib/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔍 Orders API: Starting request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('🔍 Orders API: Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name
    });

    if (!session?.user?.email) {
      console.log('❌ Orders API: No session or user email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email (more reliable than ID for NextAuth)
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.email, session.user.email))
      .limit(1);

    console.log('🔍 Orders API: User record found:', {
      hasUserRecord: !!userRecord,
      userRecordId: userRecord?.id,
      userRecordEmail: userRecord?.email
    });

    if (!userRecord) {
      console.log('❌ Orders API: No user found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 Orders API: Using user ID:', userRecord.id);

    // Fetch all orders for the user with the same structure as admin panel
    const userOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        email: orders.email,
        phone: orders.phone,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        fulfillmentStatus: orders.fulfillmentStatus,
        subtotal: orders.subtotal,
        taxAmount: orders.taxAmount,
        shippingAmount: orders.shippingAmount,
        discountAmount: orders.discountAmount,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        shippingFirstName: orders.shippingFirstName,
        shippingLastName: orders.shippingLastName,
        shippingAddress1: orders.shippingAddress1,
        shippingAddress2: orders.shippingAddress2,
        shippingCity: orders.shippingCity,
        shippingState: orders.shippingState,
        shippingPostalCode: orders.shippingPostalCode,
        shippingCountry: orders.shippingCountry,
        serviceDate: orders.serviceDate,
        serviceTime: orders.serviceTime,
        notes: orders.notes,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(eq(orders.userId, userRecord.id))
      .orderBy(desc(orders.createdAt));

    console.log('🔍 Orders API: Found orders:', {
      orderCount: userOrders.length,
      orderIds: userOrders.map(o => o.id)
    });

    // Fetch items for all orders
    const orderIds = userOrders.map(order => order.id);
    const allItems = orderIds.length > 0 ? await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds)) : [];

    console.log('🔍 Orders API: Found order items:', {
      itemCount: allItems.length,
      itemsByOrder: allItems.reduce((acc, item) => {
        acc[item.orderId] = (acc[item.orderId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    // Group items by order ID and parse addons
    const itemsByOrder = allItems.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push({
        ...item,
        addons: item.addons ? JSON.parse(item.addons as string) : null,
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Combine orders with their items, matching admin panel structure
    const ordersWithItems = userOrders.map(order => ({
      ...order,
      items: itemsByOrder[order.id] || [],
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
      }
    }));

    console.log('🔍 Orders API: Returning orders:', {
      finalOrderCount: ordersWithItems.length,
      ordersWithItems: ordersWithItems.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        itemCount: o.items.length
      }))
    });

    // Return the same structure as admin panel
    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('❌ Orders API: Error fetching orders:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 