import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, productVariants } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { normalizeVariantOptions } from '@/utils/jsonUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Get product by slug
    const product = await db
      .select({ id: products.id })
      .from(products)
      .where(and(
        eq(products.slug, slug),
        eq(products.isActive, true)
      ))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get all variants for this product
    const variants = await db
      .select({
        id: productVariants.id,
        title: productVariants.title,
        price: productVariants.price,
        comparePrice: productVariants.comparePrice,
        costPrice: productVariants.costPrice,
        sku: productVariants.sku,
        inventoryQuantity: productVariants.inventoryQuantity,
        variantOptions: productVariants.variantOptions,
        isActive: productVariants.isActive,
      })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, product[0].id),
          eq(productVariants.isActive, true)
        )
      );

    // Transform variants for frontend consumption with price matrix
    const transformedVariants = variants.map((variant) => {
      const variantOptions = normalizeVariantOptions(variant.variantOptions);

      return {
        id: variant.id,
        title: variant.title,
        price: variant.price,
        comparePrice: variant.comparePrice,
        costPrice: variant.costPrice,
        sku: variant.sku,
        inventoryQuantity: variant.inventoryQuantity,
        attributes: variantOptions,
        isActive: variant.isActive,
      };
    });

    // Create price matrix for O(1) frontend lookups
    const priceMatrix: { [key: string]: any } = {};
    transformedVariants.forEach(variant => {
      // Create a lookup key from sorted attribute combinations
      const key = Object.keys(variant.attributes)
        .sort()
        .map(attrName => `${attrName}:${variant.attributes[attrName]}`)
        .join('|');
      
      priceMatrix[key] = {
        id: variant.id,
        title: variant.title,
        price: variant.price,
        comparePrice: variant.comparePrice,
        sku: variant.sku,
        inventoryQuantity: variant.inventoryQuantity,
      };
    });

    // Get available attribute values for frontend selectors
    const attributeValues: { [attrName: string]: Set<string> } = {};
    transformedVariants.forEach(variant => {
      Object.entries(variant.attributes).forEach(([attrName, attrValue]) => {
        if (!attributeValues[attrName]) {
          attributeValues[attrName] = new Set();
        }
        attributeValues[attrName].add(attrValue);
      });
    });

    const availableAttributes = Object.entries(attributeValues).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet).sort()
    }));

    return NextResponse.json({
      success: true,
      productId: product[0].id,
      totalVariants: transformedVariants.length,
      variants: transformedVariants,
      priceMatrix,
      availableAttributes,
      // Helper methods info for frontend
      helpers: {
        getPriceByAttributes: "Use priceMatrix[generateKey(attributes)] for O(1) lookup",
        generateKey: "Sort attribute names, join as 'name:value|name:value'"
      }
    });

  } catch (error) {
    console.error('Error fetching product variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product variants' },
      { status: 500 }
    );
  }
} 