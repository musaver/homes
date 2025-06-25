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
      total
    } = body;

    // Validate required fields
    if (!name || !phone || !address || !serviceDate || !serviceTime || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, phone, address, service date, service time, or cart items' 
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

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const orderId = uuidv4();

    // Create order
    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId: session.user.id,
      email: session.user.email!,
      phone,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      subtotal: subtotal.toString(),
      taxAmount: '0.00',
      shippingAmount: '0.00',
      discountAmount: '0.00',
      totalAmount: total.toString(),
      currency: 'USD',
      
      // Use name for both billing and shipping names
      billingFirstName: name.split(' ')[0] || name,
      billingLastName: name.split(' ').slice(1).join(' ') || '',
      billingAddress1: address,
      billingCity: city || '',
      billingState: state || '',
      billingPostalCode: postalCode || '',
      billingCountry: 'US',
      
      shippingFirstName: name.split(' ')[0] || name,
      shippingLastName: name.split(' ').slice(1).join(' ') || '',
      shippingAddress1: address,
      shippingCity: city || '',
      shippingState: state || '',
      shippingPostalCode: postalCode || '',
      shippingCountry: 'US',
      
      // Service scheduling
      serviceDate,
      serviceTime,
      
      // Special instructions
      notes: specialInstructions || null,
    });

    // Create order items
    const orderItemsToInsert = cartItems.map((item: any) => {
      // Create variation title from selected variations
      let variantTitle = null;
      if (item.selectedVariations && Object.keys(item.selectedVariations).length > 0) {
        variantTitle = Object.entries(item.selectedVariations)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }

      // Store addons data
      let addonsData = null;
      if (item.selectedAddons && Array.isArray(item.selectedAddons) && item.selectedAddons.length > 0) {
        // Ensure group titles are preserved in the addons data
        addonsData = item.selectedAddons.map((addon: any) => ({
          addonId: addon.addonId,
          title: addon.title,
          price: addon.price,
          quantity: addon.quantity,
          groupTitle: addon.groupTitle || 'Ungrouped' // Preserve group title
        }));
      }

      // Calculate total price including addons
      const basePrice = item.productPrice * item.quantity;
      const addonsPrice = addonsData 
        ? addonsData.reduce((sum: number, addon: any) => 
            sum + ((addon.price || 0) * (addon.quantity || 1)), 0)
        : 0;
      const totalItemPrice = basePrice + addonsPrice;

      const orderItem = {
        id: uuidv4(),
        orderId,
        productId: item.productId,
        productName: item.productTitle,
        variantTitle: variantTitle,
        quantity: item.quantity,
        price: item.productPrice.toString(),
        totalPrice: totalItemPrice.toString(),
        productImage: item.productImage || null,
        addons: addonsData,
      };

      return orderItem;
    });

    await db.insert(orderItems).values(orderItemsToInsert);

    // Prepare email data
    const emailItems = cartItems.map((item: any) => ({
      productName: item.productTitle,
      quantity: item.quantity,
      price: item.productPrice * item.quantity,
      variations: item.selectedVariations && Object.keys(item.selectedVariations).length > 0
        ? Object.entries(item.selectedVariations)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        : '',
      addons: item.selectedAddons && item.selectedAddons.length > 0
        ? (() => {
            // Group addons by groupTitle for better email display
            const grouped = item.selectedAddons.reduce((groups: Record<string, any[]>, addon: any) => {
              const groupKey = addon.groupTitle || 'Ungrouped';
              if (!groups[groupKey]) groups[groupKey] = [];
              groups[groupKey].push(addon);
              return groups;
            }, {});
            
            return Object.entries(grouped)
              .map(([groupTitle, groupAddons]) => {
                const addons = groupAddons as any[];
                return `${groupTitle}: ${addons.map((addon: any) => `${addon.title} (${addon.quantity}x)`).join(', ')}`;
              })
              .join(' | ');
          })()
        : ''
    }));

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        session.user.email!,
        orderNumber,
        name,
        total,
        emailItems,
        serviceDate,
        serviceTime,
        specialInstructions
      );
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      message: 'Order placed successfully!'
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
} 