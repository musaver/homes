import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const categoriesData = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        image: categories.image,
        iconName: categories.iconName,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder
      })
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder);

    return NextResponse.json(categoriesData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 