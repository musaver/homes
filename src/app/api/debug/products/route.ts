import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all products to see their image data
    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        images: products.images,
        categoryId: products.categoryId,
        isActive: products.isActive,
      })
      .from(products)
      .limit(10); // Limit to first 10 for debugging

    console.log('🔍 DEBUG API - Raw products from database:');
    allProducts.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1} ---`);
      console.log(`Name: ${product.name}`);
      console.log(`Images raw:`, product.images);
      console.log(`Images type:`, typeof product.images);
      console.log(`Images length:`, Array.isArray(product.images) ? product.images.length : 'N/A');
      console.log(`Category ID:`, product.categoryId);
      console.log(`Is Active:`, product.isActive);
    });

    return NextResponse.json({
      totalProducts: allProducts.length,
      products: allProducts.map(product => ({
        ...product,
        imagesInfo: {
          raw: product.images,
          type: typeof product.images,
          length: Array.isArray(product.images) ? product.images.length : 0,
          isEmpty: !product.images || product.images === '' || product.images === 'null'
        }
      }))
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 