import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { productVariants } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { normalizeVariantOptions } from '@/utils/jsonUtils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, variationCombination } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!variationCombination || typeof variationCombination !== 'object') {
      return NextResponse.json(
        { error: 'Variation combination is required' },
        { status: 400 }
      );
    }

    console.log('🔍 API Debug - Searching for variant with:', {
      productId,
      variationCombination
    });

    // Ensure productId is treated as string for database query
    const productIdStr = String(productId);
    console.log('🔍 API Debug - Using product ID (converted to string):', productIdStr);

    // Query the product_variants table for matching variant
    const variants = await db
      .select({
        id: productVariants.id,
        price: productVariants.price,
        comparePrice: productVariants.comparePrice,
        title: productVariants.title,
        variantOptions: productVariants.variantOptions,
        sku: productVariants.sku,
        inventoryQuantity: productVariants.inventoryQuantity,
      })
      .from(productVariants)
      .where(
        and(
          eq(productVariants.productId, productIdStr),
          eq(productVariants.isActive, true)
        )
      );

    console.log(`🔍 API Debug - Found ${variants.length} variants for product ${productId}`);

    if (variants.length === 0) {
      return NextResponse.json(
        { error: 'No variants found for this product' },
        { status: 404 }
      );
    }

    // Find the variant that matches the selected combination
    let matchingVariant = null;

    console.log('🔍 API Debug - Searching through variants for match...');
    for (const variant of variants) {
      // Use our normalization utility to handle double/triple encoded JSON
      const variantOptions = normalizeVariantOptions(variant.variantOptions);

      console.log(`🔍 API Debug - Variant ${variant.id} (${variant.title}):`);
      console.log(`   Raw variantOptions:`, variant.variantOptions);
      console.log(`   Normalized variantOptions:`, variantOptions);
      console.log(`   Comparing with selection:`, variationCombination);
      console.log(`   Selection keys:`, Object.keys(variationCombination));
      console.log(`   Variant keys:`, Object.keys(variantOptions));

      // Check if this variant matches the selected combination
      const isMatch = Object.keys(variationCombination).every(key => {
        const selectedValue = variationCombination[key];
        const variantValue = variantOptions[key];
        
        // Try exact match first
        if (selectedValue === variantValue) {
          console.log(`   Checking ${key}: selected="${selectedValue}" vs variant="${variantValue}" => ✅ EXACT MATCH`);
          return true;
        }
        
        // Try case-insensitive match
        if (String(selectedValue).toLowerCase() === String(variantValue).toLowerCase()) {
          console.log(`   Checking ${key}: selected="${selectedValue}" vs variant="${variantValue}" => ✅ CASE-INSENSITIVE MATCH`);
          return true;
        }
        
        // Try trimmed match
        if (String(selectedValue).trim() === String(variantValue).trim()) {
          console.log(`   Checking ${key}: selected="${selectedValue}" vs variant="${variantValue}" => ✅ TRIMMED MATCH`);
          return true;
        }
        
        console.log(`   Checking ${key}: selected="${selectedValue}" vs variant="${variantValue}" => ❌ NO MATCH`);
        return false;
      });

      console.log(`   Overall match: ${isMatch ? '✅ YES' : '❌ NO'}`);

      if (isMatch) {
        matchingVariant = variant;
        console.log('🎉 Found matching variant:', {
          id: matchingVariant.id,
          title: matchingVariant.title,
          price: matchingVariant.price
        });
        break;
      }
    }

    if (!matchingVariant) {
      console.log('❌ No exact match found! Available variants:');
      variants.forEach((v, i) => {
        const normalizedOptions = normalizeVariantOptions(v.variantOptions);
        console.log(`   Variant ${i + 1} (${v.title}):`, {
          id: v.id,
          price: v.price,
          rawOptions: v.variantOptions,
          normalizedOptions: normalizedOptions
        });
      });
      
      return NextResponse.json(
        { 
          error: 'No variant found for the selected combination',
          debug: {
            searchedFor: variationCombination,
            availableVariants: variants.map(v => ({
              id: v.id,
              title: v.title,
              options: normalizeVariantOptions(v.variantOptions)
            }))
          }
        },
        { status: 404 }
      );
    }

    // Return the matching variant's price and details
    return NextResponse.json({
      success: true,
      price: matchingVariant.price,
      comparePrice: matchingVariant.comparePrice,
      title: matchingVariant.title,
      sku: matchingVariant.sku,
      inventoryQuantity: matchingVariant.inventoryQuantity,
      variantId: matchingVariant.id,
    });

  } catch (error) {
    console.error('Error fetching variant price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variant price' },
      { status: 500 }
    );
  }
} 