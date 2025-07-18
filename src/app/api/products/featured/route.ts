import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch featured products with category information
    const featuredProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        price: products.price,
        images: products.images,
        isFeatured: products.isFeatured,
        categoryId: products.categoryId,
        categoryName: categories.name,
        categorySlug: categories.slug,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.isFeatured, true),
          eq(products.isActive, true)
        )
      )
      .orderBy(products.createdAt);

    // Debug logging to see what images data we're getting
    console.log('🔍 Featured Products API Debug:');
    featuredProducts.forEach((product, index) => {
      console.log(`Product ${index + 1} (${product.name}):`);
      console.log(`  Images raw:`, product.images);
      console.log(`  Images type:`, typeof product.images);
    });

    return NextResponse.json({
      products: featuredProducts,
      total: featuredProducts.length
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
} 