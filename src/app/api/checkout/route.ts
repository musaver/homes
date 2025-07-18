import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, user } from '@/lib/schema';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      phone, 
      address,
      city,
      state,
      postalCode,
      serviceDate,
      serviceTime,
      specialInstructions,
      cartItems,
      subtotal,
      vatAmount,
      serviceAmount,
      total
    } = body;

    // Validate required fields
    if (!name || !phone || !address || !serviceDate || !serviceTime || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Update user profile with checkout data
    try {
      await db
        .update(user)
        .set({
          name,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          postalCode: postalCode || null,
          updatedAt: new Date(),
        })
        .where(eq(user.email, session.user.email!));
    } catch (profileError) {
      console.error('Failed to update user profile:', profileError);
      // Don't fail the order if profile update fails, just log it
    }

    // Generate order number (e.g., ORD-20240101-001)
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Create order with proper type handling
    const orderId = uuidv4();
    
    // Format tax amounts as comma-separated string: "vatAmount,serviceAmount"
    const taxAmountString = `${vatAmount || 0},${serviceAmount || 0}`;
    
    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: session.user.id,
      email: session.user.email!,
      phone: phone || '',
      status: 'pending',
      paymentStatus: 'pending',
      subtotal: subtotal || 0,
      taxAmount: taxAmountString,
      totalAmount: total || 0,
      shippingAddress1: address || '',
      shippingAddress2: null,
      shippingCity: city || null,
      shippingState: state || null,
      shippingPostalCode: postalCode || null,
      shippingCountry: 'UAE',
      notes: specialInstructions || null,
      serviceDate: serviceDate || '',
      serviceTime: serviceTime || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create order items with proper type handling
    const orderItemsData = cartItems.map((item: any) => ({
      id: uuidv4(),
      orderId: orderId,
      productId: item.productId,
      productName: item.productTitle || '',
      variantTitle: Object.entries(item.selectedVariations || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') || null,
      quantity: item.quantity || 1,
      price: (item.productPrice || 0).toString(),
      totalPrice: ((item.taxes?.finalAmount || item.productPrice) || 0).toString(),
      addons: item.selectedAddons ? JSON.stringify(item.selectedAddons) : null,
      productImage: item.productImage || null,
      productSku: item.productSku || null,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(
        session.user.email!,
        orderNumber,
        name,
        {
          subtotal: subtotal || 0,
          vatAmount: vatAmount || 0,
          serviceAmount: serviceAmount || 0,
          total: total || 0,
        },
        cartItems.map((item: any) => ({
          productName: item.productTitle || '',
          quantity: item.quantity || 1,
          price: item.productPrice || 0,
          variations: Object.entries(item.selectedVariations || {})
            .map(([key, value]) => `${key}: ${value}`)
            .join(', '),
          addons: (item.selectedAddons || []).map((addon: any) => 
            `${addon.title} (${addon.quantity}x)`
          ).join(', '),
          taxes: item.taxes || null,
        })),
        serviceDate,
        serviceTime,
        specialInstructions || ''
      );
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({ 
      success: true,
      orderNumber,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Failed to create order' 
    }, { status: 500 });
  }
} 