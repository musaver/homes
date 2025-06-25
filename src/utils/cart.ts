export interface CartItem {
  productId: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
  selectedVariations: Record<string, string>;
  selectedAddons: Array<{
    addonId: string;
    title: string;
    price: number;
    quantity: number;
    groupTitle?: string;
  }>;
  productImage?: string;
  productSku?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CART_STORAGE_KEY = 'cart_items';

export const getCart = (): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    const items: CartItem[] = stored ? JSON.parse(stored) : [];
    
    const total = items.reduce((sum, item) => {
      const itemTotal = item.productPrice * item.quantity;
      const addonsTotal = item.selectedAddons.reduce((addonSum, addon) => 
        addonSum + (addon.price * addon.quantity), 0
      );
      return sum + itemTotal + addonsTotal;
    }, 0);

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return { items, total, itemCount };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { items: [], total: 0, itemCount: 0 };
  }
};

export const addToCart = (item: CartItem): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const cart = getCart();
    
    // Check if the same product with same variations and addons already exists
    const existingItemIndex = cart.items.findIndex(cartItem => 
      cartItem.productId === item.productId &&
      JSON.stringify(cartItem.selectedVariations) === JSON.stringify(item.selectedVariations) &&
      JSON.stringify(cartItem.selectedAddons) === JSON.stringify(item.selectedAddons)
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      cart.items.push(item);
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
    return getCart(); // Recalculate totals
  } catch (error) {
    console.error('Error adding to cart:', error);
    return getCart();
  }
};

export const removeFromCart = (productId: string, variationsKey: string, addonsKey: string): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const cart = getCart();
    const filteredItems = cart.items.filter(item => {
      const itemVariationsKey = JSON.stringify(item.selectedVariations);
      const itemAddonsKey = JSON.stringify(item.selectedAddons);
      return !(item.productId === productId && 
               itemVariationsKey === variationsKey && 
               itemAddonsKey === addonsKey);
    });

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filteredItems));
    return getCart();
  } catch (error) {
    console.error('Error removing from cart:', error);
    return getCart();
  }
};

export const updateCartItemQuantity = (
  productId: string, 
  variationsKey: string, 
  addonsKey: string, 
  quantity: number
): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => {
      const itemVariationsKey = JSON.stringify(item.selectedVariations);
      const itemAddonsKey = JSON.stringify(item.selectedAddons);
      return item.productId === productId && 
             itemVariationsKey === variationsKey && 
             itemAddonsKey === addonsKey;
    });

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
    }

    return getCart();
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return getCart();
  }
};

export const clearCart = (): Cart => {
  if (typeof window === 'undefined') {
    return { items: [], total: 0, itemCount: 0 };
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    return { items: [], total: 0, itemCount: 0 };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return getCart();
  }
};

export const getCartItemCount = (): number => {
  return getCart().itemCount;
};

export const getCartTotal = (): number => {
  return getCart().total;
}; 