import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First, find the category by slug
    const category = await db
      .select()
      .from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
      .limit(1);

    if (category.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Then fetch products for this category
    const categoryProducts = await db
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
        createdAt: products.createdAt,
      })
      .from(products)
      .where(
        and(
          eq(products.categoryId, category[0].id),
          eq(products.isActive, true)
        )
      )
      .orderBy(products.createdAt);

    // Debug logging to see what images data we're getting
    console.log('🔍 API Debug - Products with images data:');
    categoryProducts.forEach((product, index) => {
      console.log(`Product ${index + 1} (${product.name}):`);
      console.log(`  Images raw:`, product.images);
      console.log(`  Images type:`, typeof product.images);
    });

    return NextResponse.json({
      category: category[0],
      products: categoryProducts
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 