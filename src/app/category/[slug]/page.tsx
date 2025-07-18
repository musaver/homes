'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { normalizeProductImages } from '@/utils/jsonUtils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  images: string[] | string | null; // Can be JSON string or array
  isFeatured: boolean;
  categoryId: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface ApiResponse {
  category: Category;
  products: Product[];
}

export default function CategoryPage() {
  const params = useParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await fetch(`/api/products/by-category/${params.slug}`);
        
        if (response.ok) {
          const result: ApiResponse = await response.json();
          // Debug: Log the first product's images to see the data structure
          if (result.products.length > 0) {
            console.log('🔍 Frontend Debug - First product images:', result.products[0].images);
            console.log('🔍 Frontend Debug - Images type:', typeof result.products[0].images);
            console.log('🔍 Frontend Debug - All products count:', result.products.length);
            
            // Test the image processing on first product
            import('@/utils/jsonUtils').then(({ normalizeProductImages }) => {
              const normalized = normalizeProductImages(result.products[0].images);
              console.log('🔍 Frontend Debug - Normalized images:', normalized);
            });
          }
          setData(result);
        } else if (response.status === 404) {
          setError('Category not found');
        } else {
          setError('Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
        setError('An error occurred while fetching products');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchCategoryProducts();
    }
  }, [params.slug]);

  // Use the same approach as the admin project for consistent image handling
  const getFirstProductImage = (imagesData: any): string | null => {
    console.log('🖼️ Raw images data:', imagesData);
    
    // Use the same utility function as admin project
    const normalizedImages = normalizeProductImages(imagesData);
    console.log('✅ Normalized images:', normalizedImages);
    
    // Return the first image or null
    const firstImage = normalizedImages.length > 0 ? normalizedImages[0] : null;
    console.log('🎯 First image:', firstImage);
    
    return firstImage;
  };

  const getProductImage = (product: Product): string => {
    const imageUrl = getFirstProductImage(product.images);
    
    // Return image URL or fallback
    if (imageUrl && imageUrl.trim() !== '') {
      return imageUrl;
    }
    
    return "/assets/img/gallery/project_2_1.jpg"; // Default fallback image
  };

  // ProductImage component with enhanced debugging and fallback
  const ProductImage = ({ imagesData, productName, width = 300, height = 250 }: { 
    imagesData: any; 
    productName: string; 
    width?: number; 
    height?: number; 
  }) => {
    const imageUrl = getFirstProductImage(imagesData);
    
    console.log('🖼️ ProductImage render:', {
      productName,
      imageUrl,
      imagesData,
      hasImageUrl: !!imageUrl
    });
    
    if (!imageUrl) {
      console.log('❌ No image URL found, showing fallback');
      return (
        <div 
          className="d-flex align-items-center justify-content-center bg-light border"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <span className="text-muted small">No Image</span>
        </div>
      );
    }

    console.log('✅ Rendering image with URL:', imageUrl);

    return (
      <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
        <Image 
          src={imageUrl}
          alt={productName}
          width={width}
          height={height}
          className="img-fluid"
          style={{ objectFit: 'cover' }}
          onLoadingComplete={() => {
            console.log('✅ Next.js Image loaded successfully:', imageUrl);
          }}
          onError={(e) => {
            console.error('💥 Next.js Image failed to load:', imageUrl);
            console.error('Error event:', e);
          }}
        />
        <div 
          className="fallback-image d-none align-items-center justify-content-center bg-light border"
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%' 
          }}
        >
          <span className="text-muted small">Image Error</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
      <Header />
        <div className="container" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LoadingSpinner size="medium" color="#0d6efd" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
      <Header />
        <div className="container" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <h2>Category Not Found</h2>
            <p className="text-muted">{error || 'The requested category could not be found.'}</p>
            <Link href="/all-categories" className="th-btn">
              Back to Categories<i className="far fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      
      {/* Breadcrumb Area */}
      <div className="breadcumb-wrapper background-image shape-mockup-wrap" style={{backgroundImage: 'url(/assets/img/bg/breadcrumb-bg.jpg)'}}>
          <div className="breadcrumb-bottom-shape"><Image src="/assets/img/bg/breadcrumb-bottom.png" alt="shape" width={100} height={100}/></div>
          <div className="shape-mockup breadcrumb-left jump-reverse"><Image src="/assets/img/icon/breadcrumb-left.png" alt="shape" width={100} height={100}/></div>
          <div className="shape-mockup breadcrumb-right jump"><Image src="/assets/img/icon/breadcrumb-right.png" alt="shape" width={100} height={100}/></div>
          <div className="container">
              <div className="breadcumb-content">
                  <h1 className="breadcumb-title">{data.category.name} </h1>
                  <ul className="breadcumb-menu">
                      <li><Link href="/">Home</Link></li>
                      <li><Link href="/all-categories">Categories</Link></li>
                      <li>{data.category.name}</li>
                  </ul>
              </div>
          </div>
      </div>
      {/* Breadcrumb */}




      {/* Category Products Area */}
      <section className="th-service-1 overflow-hidden space" id="service-sec">
        <div className="container">

          <div className="row justify-content-center">
              <div className="col-xxl-6 col-xl-7 col-lg-7 col-md-8">
                  <div className="title-area text-center"><span className="sub-title justify-content-center">{data.category.name} </span>
                      <h2 className="sec-title">{data.category.name} </h2></div>
              </div>
          </div>

          {data.category.description && (
                  <p className="sec-text">{data.category.description}</p>
          )}
          
          
            {data.products.length > 0 ? (

              
              <div className="row gy-30 ">
                {data.products.map((product, index) => (
                  <div key={product.id} className="col-xl-4 col-md-6">
                    <div className="service-card">
                        <div className="box-img">
                          <Link href={`/product-details/${product.slug}`}>
                          <ProductImage 
                            imagesData={product.images} 
                            productName={product.name}
                            width={355}
                            height={250}
                          />
                          </Link>
                        </div>
                        <div className="box-content">
                            <h3 className="box-title"><Link href={`/product-details/${product.slug}`}>{product.name}</Link></h3>
                            <p className="box-text">{product.shortDescription || product.description || 'Professional service with expert quality and reliable results.'}</p>
                        </div>
                    </div>
                  </div>

                ))}
              </div>
            ) : (
              <div className="row justify-content-center">
                <div className="col-12 text-center">
                  <div className="no-products-found">
                    <h3>No Products Found</h3>
                    <p className="text-muted">There are currently no products available in the {data.category.name} category.</p>
                    <Link href="/all-categories" className="th-btn">
                      View All Categories<i className="far fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              </div>
            )}
        </div>
      </section>

      <Footer />
    </>
  );
} 