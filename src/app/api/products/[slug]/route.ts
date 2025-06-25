import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, productAddons, addons, addonGroups } from '@/lib/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch product with all its columns and category information
    const product = await db
      .select({
        // All product columns
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        sku: products.sku,
        price: products.price,
        comparePrice: products.comparePrice,
        costPrice: products.costPrice,
        images: products.images,
        banner: products.banner,
        categoryId: products.categoryId,
        subcategoryId: products.subcategoryId,
        tags: products.tags,
        weight: products.weight,
        dimensions: products.dimensions,
        isFeatured: products.isFeatured,
        isActive: products.isActive,
        isDigital: products.isDigital,
        requiresShipping: products.requiresShipping,
        taxable: products.taxable,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        productType: products.productType,
        variationAttributes: products.variationAttributes,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        // Category information
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryDescription: categories.description,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.isActive, true)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = product[0];

    // If it's a group product, fetch addons with group information
    let addonsData: any[] = [];
    if (productData.productType === 'group') {
      const productAddonsQuery = await db
        .select({
          // Product addon fields
          id: productAddons.id,
          productId: productAddons.productId,
          addonId: productAddons.addonId,
          price: productAddons.price,
          isRequired: productAddons.isRequired,
          sortOrder: productAddons.sortOrder,
          isActive: productAddons.isActive,
          // Addon fields
          addonTitle: addons.title,
          addonPrice: addons.price,
          addonDescription: addons.description,
          addonImage: addons.image,
          addonSortOrder: addons.sortOrder,
          addonGroupId: addons.groupId,
          // Group fields
          groupTitle: addonGroups.title,
          groupDescription: addonGroups.description,
          groupSortOrder: addonGroups.sortOrder,
        })
        .from(productAddons)
        .leftJoin(addons, eq(productAddons.addonId, addons.id))
        .leftJoin(addonGroups, eq(addons.groupId, addonGroups.id))
        .where(
          and(
            eq(productAddons.productId, productData.id),
            eq(productAddons.isActive, true),
            eq(addons.isActive, true)
          )
        )
        .orderBy(
          asc(addonGroups.sortOrder),
          asc(addons.sortOrder),
          asc(productAddons.sortOrder)
        );

      addonsData = productAddonsQuery;
    }

    // Debug logging
    console.log('Product ID:', productData.id);
    console.log('Product Name:', productData.name);
    console.log('Product Type:', productData.productType);
    console.log('Addons Data:', addonsData);

    return NextResponse.json({
      ...productData,
      addons: addonsData
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}