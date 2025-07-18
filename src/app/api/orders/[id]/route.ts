import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, user } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    console.log('🔍 Order Details API: Starting request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('🔍 Order Details API: Session data:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    if (!session?.user?.email) {
      console.log('❌ Order Details API: No session or user email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the id from params
    const { id } = await params;
    console.log('🔍 Order Details API: Order ID:', id);

    // Find user by email (more reliable than ID for NextAuth)
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.email, session.user.email))
      .limit(1);

    console.log('🔍 Order Details API: User record found:', {
      hasUserRecord: !!userRecord,
      userRecordId: userRecord?.id,
      userRecordEmail: userRecord?.email
    });

    if (!userRecord) {
      console.log('❌ Order Details API: No user found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 Order Details API: Using user ID:', userRecord.id);

    // Fetch order with all its details, ensuring it belongs to the user
    const [order] = await db
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
      .where(and(
        eq(orders.id, id),
        eq(orders.userId, userRecord.id)
      ))
      .limit(1);

    console.log('🔍 Order Details API: Order found:', {
      hasOrder: !!order,
      orderId: order?.id,
      orderNumber: order?.orderNumber
    });

    if (!order) {
      console.log('❌ Order Details API: Order not found or not owned by user');
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    console.log('🔍 Order Details API: Order items found:', {
      itemCount: items.length,
      items: items.map(item => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity
      }))
    });

    // Parse addons for each item
    const itemsWithParsedAddons = items.map(item => ({
      ...item,
      addons: item.addons ? JSON.parse(item.addons as string) : null
    }));

    // Combine order with items and user info, matching admin panel structure
    const orderWithDetails = {
      ...order,
      items: itemsWithParsedAddons,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
      }
    };

    console.log('🔍 Order Details API: Returning order details:', {
      orderId: orderWithDetails.id,
      orderNumber: orderWithDetails.orderNumber,
      itemCount: orderWithDetails.items.length,
      hasUser: !!orderWithDetails.user
    });

    return NextResponse.json({ order: orderWithDetails });
  } catch (error: any) {
    console.error('❌ Order Details API: Error fetching order details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch order details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 