import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';

export async function GET() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        isActive: categories.isActive,
      })
      .from(categories)
      .limit(10);

    console.log('🔍 DEBUG - Categories in database:');
    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.slug}) - Active: ${category.isActive}`);
    });

    return NextResponse.json({
      totalCategories: allCategories.length,
      categories: allCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 