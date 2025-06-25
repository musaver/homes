import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: string;
  addons?: {
    addonId: string;
    quantity: number;
  }[];
}

export async function POST(request: Request) {
  try {
    const cartItem: CartItem = await request.json();
    
    // Get existing cart from cookies
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get('cart');
    let cart = cartCookie ? JSON.parse(cartCookie.value) : [];
    
    // Generate a unique ID for the cart item
    const cartItemId = uuidv4();
    
    // Add the new item to the cart
    cart.push({
      id: cartItemId,
      ...cartItem,
      addedAt: new Date().toISOString()
    });
    
    // Create response with updated cart
    const response = NextResponse.json({ 
      success: true, 
      message: 'Item added to cart',
      cartItemId 
    });
    
    // Set the cart cookie
    response.cookies.set({
      name: 'cart',
      value: JSON.stringify(cart),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
    
    return response;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
} 