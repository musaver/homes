import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productVariants, products } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { normalizeVariantOptions } from '@/utils/jsonUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;

    console.log('🔍 Debug - Product ID:', productId);

    // Get product info
    const product = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        productType: products.productType,
        variationAttributes: products.variationAttributes
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get all variants for this product
    const variants = await db
      .select({
        id: productVariants.id,
        title: productVariants.title,
        price: productVariants.price,
        comparePrice: productVariants.comparePrice,
        variantOptions: productVariants.variantOptions,
        isActive: productVariants.isActive,
      })
      .from(productVariants)
      .where(eq(productVariants.productId, productId));

    // Transform and analyze the data
    const analysis = {
      product: product[0],
      variantCount: variants.length,
      variants: variants.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: variant.price,
        isActive: variant.isActive,
        rawVariantOptions: variant.variantOptions,
        normalizedVariantOptions: normalizeVariantOptions(variant.variantOptions),
        variantOptionsType: typeof variant.variantOptions,
        variantOptionsLength: typeof variant.variantOptions === 'string' ? variant.variantOptions.length : 'not string'
      })),
      priceRange: {
        min: Math.min(...variants.map(v => parseFloat(String(v.price)))),
        max: Math.max(...variants.map(v => parseFloat(String(v.price))))
      }
    };

    return NextResponse.json({
      success: true,
      analysis,
      rawData: {
        product: product[0],
        variants: variants
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint failed', details: error },
      { status: 500 }
    );
  }
} 